import React, { useState, useEffect } from "react";

function ShareGameLink() {
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    const currentUrl = window.location.href;
    const urlParts = currentUrl.split("/");
    setShareUrl(urlParts.slice(0, 5).join("/"));
  }, []);

  const handleCopy = () => {
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        alert("Link copied to clipboard!");
      })
      .catch((error) => {
        console.error("Error copying link:", error);
      });
  };

  return (
    <div>
      <p>Invite friends to join with this link {shareUrl}</p>
      <button onClick={handleCopy}>Copy Link</button>
    </div>
  );
}

export default ShareGameLink;
