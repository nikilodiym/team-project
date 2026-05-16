using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;

namespace FormBuilderAPI.Services;

public class BlobStorageService : IBlobStorageService
{
    private readonly BlobContainerClient? _containerClient;
    private readonly string? _publicBaseUrl;

    public bool IsConfigured => _containerClient != null;

    public BlobStorageService()
    {
        var connectionString = Environment.GetEnvironmentVariable("AZURE_STORAGE_CONNECTION_STRING");
        var containerName = Environment.GetEnvironmentVariable("AZURE_STORAGE_CONTAINER") ?? "form-thumbnails";
        _publicBaseUrl = Environment.GetEnvironmentVariable("AZURE_STORAGE_PUBLIC_URL");

        if (string.IsNullOrWhiteSpace(connectionString))
            return;

        var blobServiceClient = new BlobServiceClient(connectionString);
        _containerClient = blobServiceClient.GetBlobContainerClient(containerName);
        _containerClient.CreateIfNotExists(PublicAccessType.Blob);
    }

    public async Task<string> UploadAsync(Stream stream, string contentType, string blobPath)
    {
        if (_containerClient == null)
            throw new InvalidOperationException("Azure Blob Storage is not configured");

        var blobClient = _containerClient.GetBlobClient(blobPath);
        await blobClient.UploadAsync(stream, new BlobUploadOptions
        {
            HttpHeaders = new BlobHttpHeaders { ContentType = contentType }
        });

        if (!string.IsNullOrWhiteSpace(_publicBaseUrl))
            return $"{_publicBaseUrl.TrimEnd('/')}/{blobPath}";

        return blobClient.Uri.ToString();
    }

    public async Task DeleteAsync(string blobUrl)
    {
        if (_containerClient == null || string.IsNullOrWhiteSpace(blobUrl))
            return;

        var blobName = ExtractBlobName(blobUrl);
        if (blobName == null)
            return;

        await _containerClient.DeleteBlobIfExistsAsync(blobName);
    }

    private string? ExtractBlobName(string blobUrl)
    {
        if (Uri.TryCreate(blobUrl, UriKind.Absolute, out var uri))
        {
            var segments = uri.AbsolutePath.Split('/', StringSplitOptions.RemoveEmptyEntries);
            if (segments.Length >= 2)
                return string.Join('/', segments.Skip(1));
        }

        return blobUrl.Contains('/') ? blobUrl.Split('/').Last() : blobUrl;
    }
}
