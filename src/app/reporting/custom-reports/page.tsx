export default function CustomReports() {
  const embedUrl = "https://workstream.embed-omniapp.co/embed/login?contentPath=%2Froot&externalId=omni_test_001&name=Amin+test&nonce=uhG4dHckuBuNhLY0wIgb8uQwiLJUt1yT&signature=WvHQaar8ts70tj5j6Zm0dlJo5cFhyUrd8QKjNES6re4&entity=testing+page+001&connectionRoles=%7B%7D&uiSettings=%7B%22showNavigation%22%3Afalse%7D&preserveEntityFolderContentRole=false";

  return (
    <div className="h-full flex flex-col">
      <iframe
        src={embedUrl}
        className="w-full h-full border-0"
        title="Custom Reports"
        allow="fullscreen"
      />
    </div>
  );
}
