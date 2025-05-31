import { Redirect } from "expo-router";

/**
 * Redirects the root URL to the /home screen.
 */

const Home = () => {
  return <Redirect href="/home" />;
};


export default Home;