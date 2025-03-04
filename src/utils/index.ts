// 🛠 Utility Function: Upload File to S3 via Signed URL
export const uploadFileToS3 = async (
  url: string,
  fields: Record<string, string>,
  file: File
) => {
  const formData = new FormData();

  // Append all required fields
  Object.entries(fields).forEach(([key, value]) => {
    formData.append(key, value);
  });

  // Append file
  formData.append("file", file);

  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to upload: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    console.log("✅ Upload successful!");
    return true;
  } catch (error) {
    console.error("❌ S3 Upload failed:", error);
    return false;
  }
};

export const fetchWithRetry = async <T>(
  url: string,
  options: RequestInit,
  retries = 3
): Promise<T> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok)
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);

      return (await response.json()) as T;
    } catch (error) {
      if (attempt === retries) throw error;
      console.warn(`Retrying... (${attempt}/${retries})`);
    }
  }
  throw new Error("Max retries reached.");
};
