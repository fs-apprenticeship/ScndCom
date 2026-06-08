"use client";
import { useEffect, useState } from "react";

export default function CreateDocExperiement() {
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/createDoc/test`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        setDoc(data);
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    //Using the preformatted text tag to display raw json.
    <div>
      {loading ? <p>Loading...</p> : <pre>{JSON.stringify(doc, null, 2)}</pre>}
    </div>
  );
}
