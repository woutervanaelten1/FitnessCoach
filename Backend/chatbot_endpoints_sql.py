"""
chatbot_endpoints_sql.py — Fitness Chatbot Endpoints

This module provides all FastAPI endpoints related to chatbot functionality, including:
- Handling general chat interactions via LangGraph workflows
- Generating personalized recommendations, goals, insights, and suggested questions
- Saving and retrieving conversation history
- Interfacing with a SQL database using LangChain for query-based reasoning
- Structuring workflows based on user input and prompt types

It relies on OpenAI's LLMs (gpt-4o-mini) and LangChain's agent capabilities for data-driven insights.
"""

import random
import os
import csv
import json
import pandas as pd
from dotenv import load_dotenv
from fastapi import APIRouter, Query, BackgroundTasks
from langchain_openai import ChatOpenAI
from database import get_db, get_schema
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langgraph.prebuilt import create_react_agent
from typing import TypedDict
from langgraph.graph import StateGraph
from langchain_community.agent_toolkits import SQLDatabaseToolkit
from langchain_community.utilities import SQLDatabase
from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from data_endpoints import reload_subjects, reload_messages


# Load environment variables from the .env file (OPENAI_API_KEY)
load_dotenv()

# Access the OpenAI API key
openai_api_key = os.getenv("OPENAI_API_KEY")

# Define router
router = APIRouter()

# File paths for storing data
SUBJECTS_FILE = "data/conversation_subjects.csv"
CONVERSATION_FILE = "data/conversation_messages.csv"
PROFILES_FILE = "data/profiles.csv"

# Initialize LLM and SQL Database tools
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.3, api_key=openai_api_key)
db_path = "data/fitness.db"
db = SQLDatabase.from_uri(f"sqlite:///{db_path}")

# LangGraph state definitions for conversation and prompt workflows
class FitnessChatState(TypedDict):
    """State used for fitness chatbot interactions."""
    user_id: str
    message: str
    conversation_id: str
    chat_history: list
    answer: str


class StandardState(TypedDict):
    """State used for goal/recommendation/detail generation workflows."""
    message: str
    answer: str
    query_type: str
    selected_prompt: str
    random_type: str

# Pydantic request/response models
class ChatRequest(BaseModel):
    user_id: str
    message: str
    conversation_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    conversation_id: str

# Cache the schema to avoid redundant DB lookups
CACHED_SCHEMA = get_schema()

# System prompt: guides the behavior, tone, and capabilities of the assistant
system_prompt = f"""
You are a fitness assistant with deep expertise in health, activity tracking, and fitness analytics.
Your role is to provide **insightful, clear, and personalized** answers based on **the SQL database** you have access to.

### **Key Information to Remember**
1. **User Context & Chat History**:
   - **Always filter by the correct user ID** — multiple users exist.
   - Example: If the user previously asked about their sleep quality and now asks, "Why do I feel tired today?", check **last night's sleep data** to form your response.

2. **Cross-Metric Analysis**:
   - Whenever possible, analyze **how different fitness metrics influence each other** (e.g., high evening activity impacting sleep quality).
   - Prioritize hidden correlations that a user may not notice but that could be meaningful.
   - Only perform **cross-metric analysis if it is logically relevant**.
   - Perform cross-metric analysis as frequently as possible when data supports it, but avoid forced assumptions.
   - Do **?NOT** assume relationships unless the data supports it, so don not fabricate relationships.

3. **Response Format**:
   - **Never expose SQL queries or mention database terms** like "tables" or "columns".
   - **Use conversational date formats** (e.g., "on the second of May" instead of "2016-05-02").
   - **Encourage the user** when appropriate ("Great job staying active!").
   - **Use emojis to enhance readability** and engagement, especially in recommendations, summaries, and encouragement messages.
   - Use **Markdown formatting** for structured responses.
   - Tables are **supported**, so format them in Markdown when needed
        | date       | steps | calories |
        |------------|-------|----------|
        | 2016-04-14 | 10250 | 1200     |
        | 2016-04-15 | 9420  | 1000     |

4. **Time-Based Data Handling**:
   - **Today's date is 2016-04-14**. If the user doesn’t specify a date, assume **today**
   - If the user asks about **sleep data** and no date is given, refer to **last night’s sleep** (e.g., subtract one day).
   - If the user asks for **weekly or monthly summaries**, retrieve **7-day or 30-day aggregated data**.

5. **SQL Query Guidelines**:
   - **NEVER** generate queries that modify the database (NO `INSERT`, `UPDATE`, `DELETE`, `DROP`).
   - **Always select relevant columns only**, do not query `SELECT *`.
   - If the user asks for a **specific date**, filter using `WHERE date = 'YYYY-MM-DD'`.
   - If the user asks for **past time ranges**, apply:
     - **Last 7 days** → `WHERE date BETWEEN 'YYYY-MM-DD' AND 'YYYY-MM-DD'`
     - **Last month** → `WHERE date >= DATE('now', '-30 days')`
     - **Custom ranges** → Apply user-defined start and end dates.

6. **Descriptive Data References**:
   - Instead of saying **"daily_activity table"**, say **"your activity tracker shows..."**.
   - Instead of saying **"weight_history table"**, say **"based on your weight log..."**.

7. **NEVER Mention**:
   - Table or column names directly.
   - SQL-related terms like "query," "database," "schema," or "entries."

8. **Table info**:
 An overview of the tables and their columns: {CACHED_SCHEMA}


9. **Data Access**:
- Use ONLY these tables:
  * daily_activity: mostly focused on activity
  * daily_data: includes almost all data of one day
  * weight_log: weight journey
  * sleep_data: DEFAULT for all general sleep questions. Has number of sleep and awake minutes per day
  * minute_sleep: (each minute and value(1 = asleep, 2 = restless, 3 = awake)): ONLY use for specific time-specific sleep pattern questions
  * heartrate_minutes: heart rate per minute
  * goals: users daily fitness goals
  * hourly_merged: intensity activities, step total and calories burned)
  * weekly_data: Weekly aggregated summaries (use for long-term trends)

---

## **Response Priorities**
1. **User Goals First** → Compare data with the user’s fitness goals when applicable.
2. **Time Context** → Prioritize recent data over historical trends unless requested.
3. **Actionable Insights** → Provide **1 concrete improvement suggestion** per response.

### **Concise Response Format (For Lists)**
- By default, provide **only the top 3 most relevant** points, whether it's **recommendations, tips, alternatives, ideas...**. UNLESS users specifies. 
- Prioritize **high-impact, actionable, or diverse** options.
- Keep phrasing **short and clear** avoid excessive explanations.
- If multiple categories exist, **summarize instead of listing all**.
- **Multi-step processes** should be ordered **from most important (highest priority) to least important** to ensure clarity and effectiveness.
- **EXCEPTION:** If the user asks for a specific number (e.g., "Give me 5 tips"), provide exactly that amount.
---

## **Example Rewrites**
**Bad**: "Your daily_activity table shows 10k steps."
**Good**: "You reached 10,000 steps yesterday!"

---

## **Chain of Thought Reasoning**
For **complex or multi-step questions**, follow **this reasoning process**:
1. **Break the question into smaller parts.**
2. **Think through each step logically.**
3. **Form a clear, well-structured final response.**

### **Example:**
**User Question**:"How many steps have I taken this week?"

**Reasoning Process**:
1. Retrieve daily step counts from `daily_activity` for the **past 7 days**.
2. Sum these values to get the **weekly total**.
3. Retrieve user's weekly step goal from and multiply it by 7.
4. Compare it with the user’s **weekly step goal**.

**Final Response**: "This week, you’ve taken **56,000 steps** so far. You’re close to your weekly goal—great job!"

---

## **Cross-Metric Insights**
Use **logical cross-metric analysis** when relevant:
- **Activity (Steps, Active Minutes) vs. Sleep** → High activity late at night might lead to restless sleep.
- **Heart Rate vs. Sleep** → Elevated heart rate before bedtime might correlate with poor sleep.
- **Calories Burned vs. Weight** → Consistently burning fewer calories might contribute to weight gain.
- **Sedentary Time vs. Energy Levels** → High sedentary time might lead to low energy.
- Use your own knowledge and reasoning to derive logical correlations

---

## **Example Responses**
**User**: "Why was my sleep so restless?"
**Response**: "Your sleep was restless last night because your **heart rate stayed elevated** for an hour before bedtime, likely due to late-night activity. Try winding down earlier for better sleep quality."

**User**: "How efficient is my sleep?"
**Response**: "Last night, you were in bed for **8 hours** but only slept for **6 hours and 45 minutes**, resulting in an **84% sleep efficiency**. This is fairly good, but reducing interruptions might improve it further."

**User**: "Why did I burn fewer calories yesterday?"
**Response**: "Yesterday, your **steps were significantly lower** at 3,500, and your **active minutes** totaled only 15. This reduced activity led to fewer calories burned than usual."

---

## **Final Notes**
- **ALWAYS provide clear, concise reasoning in responses.**
- **BULLET POINTS** → Max **3 recommendations per response**. 
- **EMOJIS** → Use to highlight key info.  
- **If you don't have the right data or information, just tell the user. Don't come up with your own things! **
- **DO NOT assume relationships between metrics unless supported by data.**
- **NEVER expose SQL queries, table names, or technical storage details.**
- **Focus on health & fitness insights, not raw numbers.**
- **NO calorie intake data** → Only calories burned is tracked. 
- **Today's Date: 2016-04-14** (assume today unless user specifies).
- **ALWAYS USE HOURS for sleep** → Convert 650 minutes to `10h 50m"`. 
- If the user asks for recommendations, ideas, advice... anyhing in a list **select the top 3**, keep it short (UNLESS user specifies)
- ALWAYS filter for the right ID of the user and NEVER mention someone else's data
- Use your general health and fitness knowledge (evidence-based where possible) in combination with the user's fitness data.
- Do NOT treat data within a healthy range (e.g., 8.5 hours of sleep) as unhealthy unless clearly justified.
- Apply known health guidelines (e.g., for sleep, steps, activity) to guide suggestions, but do NOT hardcode specific numbers. Adapt based on what’s healthy and realistic for the user.
"""

# Prompt for generating a new user goal based on their past week’s performance
new_goal_output = """
You are analyzing a user's past week of fitness data to suggest a realistic **daily goal** for one metric (e.g., steps, sleep, calories, activity time).

Your suggestion should:
- Support a **healthy lifestyle**
- Be **achievable based on recent performance**
- Use **general health guidelines** (e.g., 7–9h sleep, 8,000–10,000 steps, 30–60 min activity), but **adapt to user context and use your OWN KNOWLEDGE ABOUT THESE GUIDELINES**
- Avoid fixed targets — adapt incrementally

Important Guidelines:
1. If user hits current goal → suggest keeping it.
2. If user falls short often → suggest a **lower** goal.
3. If user consistently exceeds → suggest a **slightly higher** goal.
4. Use reasoning to balance long-term health and short-term achievability.
5. Do **not** suggest extremes (e.g., 15h sleep ≠ healthy).
6. Return **only** the exact JSON format below — no explanations or extra content.

Respond only in the following format, only these two JSON fields and NOTHING else!
Make sure your response is always in the following JSON format:

  "goal": "Your suggested goal as a number (rounded)",
  "justification": "A short, clear sentence explaining why you chose this goal based on the data and optionally provide a benefit"

"""

# Prompt to generate 3 clear, personalized daily recommendations with reasoning
generate_recommendation_prompt = """Generate 3 actionable recommendations, they need to be based on todays data. Don't explicitly state the date, but talk about today. They all need to be one sentence long and in the following JSON format:
    [
        "recommendation": "Your one sentence actionable recommendation",
        "reason": "Why should the user perform this recommendation. If possible, relate the user's goal to it.",
        "benefit": "What is the benefit if the user does this recommendation.",
        "metric": "Which metric is highlighted, choose from: sleep, steps, activity, sedentary, calories, general",
        "question": "Provide a clear and specific follow-up question phrased in the 'I' form, as if the user is asking it themselves. The user can use this question and ask the chatbot to get additional help, ideas, or clarification. This question needs enough information so the chatbot knows how to answer it, so be clear and specific.",
    ]
"""

# Prompt to create varied, personalized follow-up questions for the user to ask
suggested_questions_output = """ Generate 3 suggested questions that I can ask the chatbot based on my fitness data. 
These questions need to be varied, you can base them on different metrics (sleep, weight, steps...), different granularity (daily, weekly, monthly) or just a general question...
Make sure the questions are varied and encourage further exploration of different metrics. 
Each question should be relevant, actionable, or insightful. 

Use the following rules for the questions:
1. Personalize the question using 'I' to simulate the user's perspective.
2. Ensure the questions vary in type (e.g., about goals, insights, and progress).
3. Keep each question clear, concise, and motivating.
4. Use conversational language that feels natural to a fitness app user.

Output the 3 questions in the following JSON format:

[
    "question": "Your first suggested question here"
]
"""


def detail_output(random_type):
    """
    Generate a system prompt instructing the language model to return either an 'insight', 'question', or 'advice' 
    about a selected fitness metric, tailored to the user's data.

    Parameters:
    -----------
    random_type : str
        The type of content to generate. Must be one of: 'insight', 'question', or 'advice'.

    Returns:
    --------
    str
        A formatted system prompt string with specific guidance for the model, including:
        - Detailed generation rules for the selected type
        - A required JSON output format

    Notes:
    ------
    - The function does not validate the `random_type` value. If it is invalid, a generic fallback message is used.
    - The returned prompt enforces both content guidelines and output structure, ensuring consistency.
    - The LLM should not return anything outside the specified JSON format.
    """
    type_clarification = {
        "insight": (
            "Analyze the chosen metric and identify a meaningful relationship with another metric from a different dataset. "
            "This relationship should be unique, non-obvious, relevant and helpful for the user. For example: "
            "'Your high step count right before bedtime might contribute to a restless start to your sleep because physical activity can increase alertness.' "
            "or, 'You have a high heart rate before bedtime, which might affect your sleep quality of last night,' "
            "or 'The fact that you weren't very active during the day might be contributing to poor sleep quality.' "
            "These insights can also be positive as well! If someone had a higher heart rate throughout the day or less sedentary time than normal, this could for example enhance their sleep."
            "Ensure that the relationship is causally correct: for example, 'Your total distance covered today is positively correlated "
            "with your calorie burn, meaning the more distance you walk or run, the more calories you are likely to burn.' and not the other way around. "
            "Explain the relationship clearly and why it matters, by using phrases like 'as a result of' or 'because' to clarify the direction of influence."
            "Support your insight using your general knowledge about health, sleep, physical activity, and wellness guidelines when relevant. "
            "Also REMEMBER: for example 15 minutes of bad sleep is normal, this will not have a big influence. Look for something that is special or unusual for the user."
            "If possible make the insight actionable by suggesting why this relationship matters and how the user can leverage it to improve their routine."
            "Keep the insight short and easy to read, this encourages the user to read it! Use emojis if this makes it easier. Maximum two sentences, around 50 words!"
            "Also keep the words rather simple, don't formulate it in a difficult way!"
        ),
        "question": (
            "Craft a thought-provoking question based on the data that encourages curiosity or leads to actionable exploration. "
            "The question should be written from the user's perspective. For example: 'Why do I feel more tired on days with low activity even though I sleep enough?' "
            "or 'Does my step count before bedtime affect my sleep quality?' Frame the question conversationally, as though the user is asking it."
        ),
        "advice": (
            "Advice should offer actionable suggestions along with a reason why I should do this."
            "For example: 'Try to go for a short walk before bedtime, this will help you reach your step goal and will positively influence your sleep quality.' "
            "Advice the user somthing by talking directly to him, this can be done by using 'you'."
            "Use your general knowledge of health, wellness, and fitness guidelines to guide your advice — but only suggest improvements if the user's data is outside of recommended healthy ranges. "
            "Avoid recommending changes when the metric is already in a healthy range. "
            "Keep the advice short and easy to read, this encourages the user to read it! Use emojis if this makes it easier. Maximum two sentences!"
            "Make sure the advice is about the chosen metric. This way the user knows what to do.")
    }
    clarification_sentence = type_clarification.get(
        random_type, "Provide an interesting detail about the data.")

    return f""" I want to know something more about the chosen metric. Your task is to analyze the user's data and generate a detailed response by using your tools.
    In your response should be the following:
    {clarification_sentence}
    The generated response needs to be in the following JSON format.

        "type": "{random_type}",
        "content": "Your content here."

    The first field indicates whether it's an 'insight', 'question', or 'advice', choose one of these randomly. The second field is the content.
    """

# Prompt template for the conversational agent using chat history and scratchpad memory
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system_prompt),
        MessagesPlaceholder("chat_history"),
        ("human", "{input}"),
        ("placeholder", "{agent_scratchpad}"),
    ]
)

# Toolkit and agent setup for SQL-based fitness data retrieval
toolkit = SQLDatabaseToolkit(db=db, llm=llm)
tools = toolkit.get_tools()
agent_executor = create_react_agent(llm, tools, prompt=system_prompt)

def get_user_info(user_id):
    """
    Retrieve user profile information by ID from the profiles CSV.

    Parameters:
    -----------
    user_id : str
        The user ID to look up.

    Returns:
    --------
    dict or None
        A dictionary with user profile data if found, otherwise None.
    """
    try:
        df = pd.read_csv(PROFILES_FILE, dtype={"id": str})
        user_data = df[df["id"] == user_id]
        if not user_data.empty:
            return user_data.iloc[0].to_dict()
        else:
            return None

    except FileNotFoundError:
        return None
    except Exception as e:
        return None


def generate_conversation_title(user_message, ai_response):
    """
    Generate a conversation title based on the user's message and chatbot response.

    Returns:
    --------
    str
        A concise title summarizing the topic of the conversation.
    """
    prompt_title = f"""
    Generate a concise, descriptive title for this conversation based on the following:
    User: {user_message}
    AI: {ai_response}
    Provide only the title, without any additional text.
    """
    response = llm.invoke(prompt_title)
    return response.content.strip()


def save_subject(conversation_id, user_id, title):
    """Save a subject (generated title) to the CSV."""
    timestamp = datetime.now().isoformat()
    clean_title = title.encode(
        # Sanitize text
        'utf-8', 'ignore').decode('utf-8').replace('\u0092', "'")
    with open(SUBJECTS_FILE, mode="a", newline="", encoding="utf-8") as file:
        writer = csv.writer(file, quoting=csv.QUOTE_MINIMAL)
        writer.writerow([conversation_id, user_id, clean_title, timestamp])
    reload_subjects()

def save_message(conversation_id, user_id, role, message):
    """
    Save a message (user or assistant) to the conversation CSV file.
    Automatically appends a timestamp and reloads the message history.
    """
    timestamp = datetime.now().isoformat()
    clean_message = message.encode(
        'utf-8', 'ignore').decode('utf-8').replace('\u0092', "'")

    with open(CONVERSATION_FILE, mode="a", newline="", encoding='utf-8') as file:
        writer = csv.writer(file, quoting=csv.QUOTE_MINIMAL)
        writer.writerow([conversation_id, user_id,
                        role, clean_message, timestamp])
    reload_messages()


def get_chat_history(conversation_id):
    """
    Retrieve the full message history for a given conversation ID.

    Returns:
    --------
    list
        A list of HumanMessage and AIMessage objects to be used in chat context.
    """
    history = [""]
    with open(CONVERSATION_FILE, mode="r", encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            if row["conversation_id"] == conversation_id:
                if row["role"] == "user":
                    history.append(HumanMessage(content=row["message"]))
                elif row["role"] == "assistant":
                    history.append(AIMessage(content=row["message"]))

    return history

def classify_question(state):
    """Determines if user data is needed and updates state."""
    classification_prompt = ChatPromptTemplate.from_messages(
        [
            ("system", "You are a fitness assistant. Determine if the following question requires user-specific fitness data."),
            MessagesPlaceholder("chat_history"),
            (
                "human",
                "Based on the following question, decide whether data retrieval is needed "
                "to produce an accurate answer. If data retrieval is required, reply with 'DATA'; "
                "if not, reply with 'GENERAL'. Do not include any extra text. Question: {question}"
            ),
        ]
    )

    classification_response = llm.invoke(
        classification_prompt.format_messages(
            question=state["message"], chat_history=state["chat_history"]
        )
    ).content.strip().lower()

    return {"requires_data": "data" in classification_response}


def route_based_on_decision(state):
    """Decides which path to take based on classification."""
    if state.get("requires_data", False):
        return "fetch_data"
    else:
        return "llm_answer"


def get_prompt(state):
    """Selects the correct prompt based on query_type."""
    query_type = state["query_type"]

    prompts = {
        "goal": new_goal_output,
        "suggested_questions": suggested_questions_output,
        "recommendations": generate_recommendation_prompt,
    }

    if query_type == "detail":
        prompts["detail"] = detail_output(state.get("random_type", "insight"))

    # Default prompt if query_type is unknown
    return {"selected_prompt": prompts.get(query_type, "Provide a fitness-related response.")}


# LLM Answer Node (when no user data is needed)
def llm_response(state):
    """Directly answer the user's question using LLM knowledge."""

    chat_history = state.get("chat_history", [])

    messages = [
        SystemMessage(content=system_prompt ), 
        *chat_history,
        HumanMessage(content=state["message"]),
    ]

    response = llm.invoke(messages)
    return {"answer": response.content}

def retrieve_and_answer(state):
    """Fetch user-specific data and generate an answer."""
    if "query_type" in state:
        input_prompt = state["selected_prompt"] + " " + state["message"]
        messages = [{"role": "user", "content": input_prompt}]
    else:
        messages = state.get("chat_history", []) + \
            [{"role": "user", "content": state["message"]}]
    response = agent_executor.invoke({"messages": messages} , {"recursion_limit": 35})

    state.pop("query_type", None)
    state["answer"] = response["messages"][-1].content
    return state

def format_output_response(state):
    """
    Runs the final assistant response through a formatting LLM to:
    - Enforce output constraints (e.g., 3 bullet point limit)
    - Hide SQL/database details
    - Format sleep times as hours and minutes
    """
    judge_llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

    # Strict judging system prompt
    system_msg = SystemMessage(content="""
        You are a strict evaluator of fitness advice.

        Your job is to:
        - NEVER include more than 3 bullet points or list items **unless the user's question explicitly asks for more**.
        - NEVER expose technical details such as SQL queries, table names, IDs, or storage mechanisms.
        - ALWAYS convert sleep durations to hours and minutes (e.g., 650 minutes → "10h 50m") unless the user asks for minutes.
        - Only correct what breaks these rules — do NOT add new information or rephrase unnecessarily.
        - If the answer is already clean and compliant, don't adjust the answer but return it as it is!

        Your task is to return the corrected response **only**. Do NOT explain the changes.
        """)

    human_msg = HumanMessage(content=f"""
        User's Question:
        {state["message"]}

        Assistant's Response:
        {state["answer"]}
        """)

    revised = judge_llm.invoke([system_msg, human_msg])
    state["answer"] = revised.content
    return state

# ------------------------
# LangGraph: Chat Workflow
# ------------------------


# Build the LangGraph stateful workflow for answering general fitness questions
chat_workflow = StateGraph(state_schema=FitnessChatState)

# Step 1: Retrieve Chat History
chat_workflow.add_node("retrieve_chat_history", lambda state: {
    "chat_history": get_chat_history(state["conversation_id"]),
    "question": state["message"]
})
chat_workflow.add_edge("retrieve_chat_history", "classify_question")

# Step 2: Classify if the question requires user-specific fitness data
chat_workflow.add_node("classify_question", classify_question)

# Step 3: Based on classification, route to LLM answer or data retrieval
chat_workflow.add_conditional_edges(
    "classify_question",
    route_based_on_decision,
    {"fetch_data": "fetch_data", "llm_answer": "llm_answer"}
)

# Step 4.1: LLM Answer Node
chat_workflow.add_node("llm_answer", llm_response)
chat_workflow.add_edge("llm_answer", "format_output_response")

# Step 4.2: Retrieve Data & Answer
chat_workflow.add_node("fetch_data", retrieve_and_answer)
chat_workflow.add_edge("fetch_data", "format_output_response")  # Optional step

# Step 5: Format the LLM output
chat_workflow.add_node("format_output_response", format_output_response)
chat_workflow.add_edge("format_output_response", "return_result")

# Step 6: Return Final Answer
chat_workflow.add_node("return_result", lambda state: {
                       "final_answer": state["answer"]})

# Set entry point
chat_workflow.set_entry_point("retrieve_chat_history")

# Compile LangGraph
chat_graph = chat_workflow.compile()

# -------------------------------
# LangGraph: Goal/Prompt Workflow
# -------------------------------

# Separate workflow for handling goal generation and suggested questions
workflow = StateGraph(state_schema=StandardState)

# Step 1: Select Prompt bas on query
workflow.add_node("select_prompt", get_prompt)
workflow.add_edge("select_prompt", "retrieve_and_answer")

# Step 2: Retrieve data and generate structured responses
workflow.add_node("retrieve_and_answer", retrieve_and_answer)
workflow.add_edge("retrieve_and_answer", "return_result")

# Final node that returns the processed state
workflow.add_node("return_result", lambda state: state)

# Set Entry Point
workflow.set_entry_point("select_prompt")

# Compile Goal-Setting Graph
graph = workflow.compile()


def parse_response_content(response_content):
    """Attempts to parse the JSON content from an LLM response."""
    content_cleaned = response_content.strip("```").strip("json").strip()
    try:
        return json.loads(content_cleaned)
    except json.JSONDecodeError:
        print("Error parsing JSON content.")
        return {}


@router.get("/")
async def root():
    """Root endpoint for health check."""
    return {"message": "Welcome to the Fitness Chatbot part"}


@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest, background_tasks: BackgroundTasks):
    """
    Main chat endpoint for conversational interaction.

    - Constructs a prompt using the user's message and profile
    - Passes this to the LangGraph agent
    - Stores conversation data and title in the background
    """

    user_id = request.user_id
    user_profile = get_user_info(user_id)

    try:
        conversation_id = request.conversation_id or f"{request.user_id}_{int(datetime.now().timestamp())}"
        question = f"""
        Today is 14-04-2016. The user details are:
        - Name: {user_profile.get('name')}
        - Age: {user_profile.get('age')} years old
        - Height: {user_profile.get('height')} meters
        - Gender: {user_profile.get('gender')}
        - ID: {user_id}

        This is the users question: {request.message}
        """
        state = FitnessChatState(
            message=question, conversation_id=conversation_id, user_id=user_id)

        response = chat_graph.invoke(state)

        def clean_text(text):
            return text.encode('utf-8', 'ignore').decode('utf-8').replace('\u0092', "'")

        bot_response = clean_text(response["answer"])
        clean_question = clean_text(question)

        if not request.conversation_id:
            title = generate_conversation_title(question, response["answer"])
            background_tasks.add_task(
                save_subject, conversation_id, user_id, title)

        background_tasks.add_task(
            save_message, conversation_id, user_id, "user", clean_question)
        background_tasks.add_task(
            save_message, conversation_id, user_id, "assistant", bot_response)

        return ChatResponse(response=response["answer"], conversation_id=response["conversation_id"])

    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        return ChatResponse(
            response="An error occurred while processing your request. Please try again.",
            conversation_id=conversation_id
        )


@router.get("/recommendations")
async def get_recommendations(date: str = Query(..., description="Date in YYYY-MM-DD format"), user_id: str = Query(..., description="User ID to filter the data")):
    """
    Generate 3 personalised, actionable fitness recommendations for the given user and date.

    - Uses user's profile, goals, and daily data
    - Returns response in strict JSON format
    """
    user_profile = get_user_info(user_id)
    if not user_profile:
        return {"error": "User not found"}

    question = f"""
    Today is {date}. The user details are:
    - Name: {user_profile.get('name')}
    - Age: {user_profile.get('age')} years old
    - Height: {user_profile.get('height')} meters
    - Gender: {user_profile.get('gender')}
    - ID: {user_id}

    Analyze their profile, their goals AND todays data and provide **3 actionable fitness recommendations** for today. 
    Format the response strictly in JSON!
    """

    response = graph.invoke(
        {"query_type": "recommendations", "message": question})
    data = parse_response_content(response["answer"])

    if data:
        return {"recommendations": data}
    return {"error": "Failed to generate recommendations. Please try again."}


@router.get("/new_goal")
async def get_new_goal(
    date: str = Query(..., description="Date in YYYY-MM-DD format"),
    metric: str = Query(..., description="Metric for the goal, e.g., 'steps'"),
    current_goal: int = Query(..., description="Current goal value"),
    user_id: str = Query(..., description="User ID to filter the data"),
    average: float = Query(..., description="Last weeks average")
):
    """
    Suggest a new realistic and motivating fitness goal for a given metric.

    - Takes current goal, last week's average, and user profile into account
    - Returns the goal and a short justification in JSON format
    """
    user_profile = get_user_info(user_id)
    if not user_profile:
        return {"error": "User not found"}

    if average > 0:
        extra = f"\n    The user had an average of {average} last week!"
    else:
        extra = ""

    question = f"""
    Today is {date}. The user details are:
    - Name: {user_profile.get('name')}
    - Age: {user_profile.get('age')} years old
    - Height: {user_profile.get('height')} meters
    - Gender: {user_profile.get('gender')}
    - ID: {user_id}

    The user wants a new goal for {metric}. The current goal is {current_goal} per day.
    {extra}
    
    Based on their profile, fitness level, LAST WEEKS DATA and progress, suggest a **realistic and motivating new goal** for {metric}.
    Also think about 'general health benefits'
    Format the response strictly in JSON!
    """

    response = graph.invoke({"query_type": "goal", "message": question})
    data = parse_response_content(response["answer"])

    if data:
        return {"suggestion": data}
    return {"error": "Failed to generate recommendations. Please try again."}


@router.get("/suggested_questions")
async def get_suggested_questions(date: str = Query(..., description="Date in YYYY-MM-DD format"), user_id: str = Query(..., description="User ID to filter the data")):
    """
    Return 3 diverse questions the user could ask the chatbot based on their profile and possible interests.
    
    - Aims to spark exploration and increase engagement
    - Questions are personalised and varied
    """
    user_profile = get_user_info(user_id)
    if not user_profile:
        return {"error": "User not found"}

    question = f"""
    Today is {date}. The user details are:
    - Name: {user_profile.get('name')}
    - Age: {user_profile.get('age')} years old
    - Height: {user_profile.get('height')} meters
    - Gender: {user_profile.get('gender')}
    - ID: {user_id}

    Based on their fitness level and possible needs, suggest **3 meaningful questions** 
    they can ask the chatbot about their health, fitness, progress...
    
    Format the response strictly in JSON!
    """

    response = graph.invoke(
        {"query_type": "suggested_questions", "message": question})
    data = parse_response_content(response["answer"])

    if data:
        return {"questions": data}
    return {"error": "Failed to generate recommendations. Please try again."}


@router.get("/detail")
async def get_detail(
    date: str = Query(..., description="Date in YYYY-MM-DD format"),
    metric: str = Query(..., description="Metric for the goal, e.g., 'steps'"),
    user_id: str = Query(..., description="User ID to filter the data")
):
    """
    Generate a specific 'insight', 'question', or 'advice' for a chosen metric.

    - Randomly selects the type
    - Leverages user's profile and metric focus
    - Avoids future speculation
    """
    user_profile = get_user_info(user_id)
    if not user_profile:
        return {"error": "User not found"}

    random_type = random.choice(["insight", "question", "advice"])
    question = f"""
    Today is {date}. The user details are:
    - Name: {user_profile.get('name')}
    - Age: {user_profile.get('age')} years old
    - Height: {user_profile.get('height')} meters
    - Gender: {user_profile.get('gender')}
    - ID: {user_id}

    The user is focusing on the {metric} metric today.
    Provide a relevant **{random_type}** related to {metric} that is useful for the user.
    This can be about today, a whole week, month, a few days... but not about the future!
    
    Format the response strictly in JSON!
    """
    
    response = graph.invoke(
        {"query_type": "detail", "message": question, "random_type": random_type})
    data = parse_response_content(response["answer"])

    if data:
        return {"output": data}
    return {"error": "Failed to generate recommendations. Please try again."}
