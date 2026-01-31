import React, { useEffect } from "react";
import axios from "axios";
function App() {
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/data")
      .then((res) => console.log("Data from backend:", res.data))
      .catch((err) => console.error(err));
  }, []);
  return <h1 className="text-3xl font-bold underline">Check the Console!</h1>;
}
export default App;
