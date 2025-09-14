import { useState } from "react";
import "./App.css"; // make sure your CSS includes modal & form styles

function App() {
  const [encFile, setEncFile] = useState(null);
  const [decFile, setDecFile] = useState(null);
  const [encMessage, setEncMessage] = useState("");
  const [encPassword, setEncPassword] = useState("");
  const [decPassword, setDecPassword] = useState("");
  const [encPreview, setEncPreview] = useState(null);
  const [decPreview, setDecPreview] = useState(null);
  const [encryptedBlob, setEncryptedBlob] = useState(null);

  // Modal for decrypted message
  const [decryptedMessage, setDecryptedMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Handle encrypt file selection
  const handleEncFileChange = (e) => {
    const file = e.target.files[0];
    setEncFile(file);
    if (file) setEncPreview(URL.createObjectURL(file));
    else setEncPreview(null);
  };

  // Handle decrypt file selection
  const handleDecFileChange = (e) => {
    const file = e.target.files[0];
    setDecFile(file);
    if (file) setDecPreview(URL.createObjectURL(file));
    else setDecPreview(null);
  };

  // Encryption
  const handleEncrypt = async (e) => {
    e.preventDefault();
    if (!encFile || !encMessage || !encPassword) return;

    const formData = new FormData();
    formData.append("image_file", encFile);
    formData.append("message", encMessage);
    formData.append("password", encPassword);

    try {
      const response = await fetch("http://localhost:8000/embed", {
        method: "POST",
        body: formData,
      });

      const blob = await response.blob();
      setEncryptedBlob(blob);
      alert("Encryption successful! Click the download button below.");
    } catch (err) {
      console.error("Encryption failed:", err);
      alert("Encryption failed. Check console.");
    }
  };

  // Decryption
  const handleDecrypt = async (e) => {
    e.preventDefault();
    if (!decFile || !decPassword) return;

    const formData = new FormData();
    formData.append("image_file", decFile);
    formData.append("password", decPassword);

    try {
      const response = await fetch("http://localhost:8000/extract", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setDecryptedMessage(data.message);
      setShowModal(true);
    } catch (err) {
      console.error("Decryption failed:", err);
      alert("Decryption failed. Check console.");
    }
  };

  return (
    <div>
      <header className="app-header">
        <h1>AES Image Messenger 🔒</h1>
      </header>

      <main className="app-main">
        <div className="forms-container">
          {/* Encryption Form */}
          <form className="encrypt-message" onSubmit={handleEncrypt}>
            <h2>Encrypt</h2>
            <label>
              Select Image:
              <input type="file" accept="image/*" onChange={handleEncFileChange} />
            </label>
            {encPreview && <img src={encPreview} alt="Encrypt Preview" className="image-preview" />}
            <label>
              Secret Message:
              <textarea
                value={encMessage}
                onChange={(e) => setEncMessage(e.target.value)}
                placeholder="Enter your message"
              />
            </label>
            <label>
              Password:
              <input
                type="password"
                value={encPassword}
                onChange={(e) => setEncPassword(e.target.value)}
                placeholder="Enter password"
              />
            </label>
            <button type="submit" className="encrypt">Encrypt</button>

            {/* Download button */}
            {encryptedBlob && (
              <button
                type="button"
                className="encrypt-download"
                onClick={() => {
                  const url = window.URL.createObjectURL(encryptedBlob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `stego_${encFile.name}`;
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                }}
              >
                Download Encrypted Image
              </button>
            )}
          </form>

          {/* Decryption Form */}
          <form className="decrypt-message" onSubmit={handleDecrypt}>
            <h2>Decrypt</h2>
            <label>
              Select Encrypted Image:
              <input type="file" accept="image/*" onChange={handleDecFileChange} />
            </label>
            {decPreview && <img src={decPreview} alt="Decrypt Preview" className="image-preview" />}
            <label>
              Password:
              <input
                type="password"
                value={decPassword}
                onChange={(e) => setDecPassword(e.target.value)}
                placeholder="Enter password"
              />
            </label>
            <button type="submit" className="decrypt">Decrypt</button>
          </form>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Decrypted Message</h2>
              <p>{decryptedMessage}</p>
              <button onClick={() => setShowModal(false)}>Close</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
