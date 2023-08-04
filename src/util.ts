export function formatLocalYMD(date: Date) {
  const offset = date.getTimezoneOffset();
  const adjusted = new Date(date.getTime() - offset * 60 * 1000);
  return adjusted.toISOString().split("T")[0];
}

export function downloadStr(str: string, fileName: string) {
  const blob = new Blob([str], { type: "text/plain" });
  const tempLink = document.createElement("a");
  tempLink.href = URL.createObjectURL(blob);
  tempLink.download = fileName;
  document.body.appendChild(tempLink);
  tempLink.click();
  tempLink.parentNode!.removeChild(tempLink);
}
