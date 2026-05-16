namespace FormBuilderAPI.Services;

public interface IBlobStorageService
{
    bool IsConfigured { get; }
    Task<string> UploadAsync(Stream stream, string contentType, string blobPath);
    Task DeleteAsync(string blobUrl);
}
