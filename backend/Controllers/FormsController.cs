using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using FormBuilderAPI.Data;
using FormBuilderAPI.Helpers;
using FormBuilderAPI.Models.Entities;
using FormBuilderAPI.Models.DTOs.Forms;
using FormBuilderAPI.Services;

namespace FormBuilderAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FormsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IBlobStorageService _blobStorage;

    public FormsController(AppDbContext context, IBlobStorageService blobStorage)
    {
        _context = context;
        _blobStorage = blobStorage;
    }

    private Guid GetUserId()
    {
        var userId = UserClaimsHelper.GetUserId(User);
        if (userId == null)
            throw new UnauthorizedAccessException();
        return userId.Value;
    }

    [HttpGet]
    public async Task<IActionResult> GetMyForms(
        [FromQuery] string? search,
        [FromQuery] string sortBy = "createdAt",
        [FromQuery] string sortDir = "desc")
    {
        var userId = GetUserId();

        var query = _context.Forms.Where(f => f.OwnerId == userId);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(f =>
                f.Title.ToLower().Contains(term) ||
                (f.Description != null && f.Description.ToLower().Contains(term)));
        }

        var descending = sortDir.Equals("desc", StringComparison.OrdinalIgnoreCase);

        query = (sortBy.ToLower(), descending) switch
        {
            ("title", false) => query.OrderBy(f => f.Title),
            ("title", true) => query.OrderByDescending(f => f.Title),
            ("status", false) => query.OrderBy(f => f.Status),
            ("status", true) => query.OrderByDescending(f => f.Status),
            ("updatedat", false) => query.OrderBy(f => f.UpdatedAt),
            ("updatedat", true) => query.OrderByDescending(f => f.UpdatedAt),
            (_, false) => query.OrderBy(f => f.CreatedAt),
            _ => query.OrderByDescending(f => f.CreatedAt),
        };

        var forms = await query
            .Select(f => new FormListItemDto
            {
                Id = f.Id,
                Title = f.Title,
                Description = f.Description,
                ThumbnailUrl = f.ThumbnailUrl,
                Status = f.Status,
                IsPublic = f.IsPublic,
                CreatedAt = f.CreatedAt,
                UpdatedAt = f.UpdatedAt
            })
            .ToListAsync();

        return Ok(forms);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetForm(Guid id)
    {
        var userId = GetUserId();

        var form = await _context.Forms
            .Include(f => f.Questions)
                .ThenInclude(q => q.Options)
            .FirstOrDefaultAsync(f => f.Id == id && f.OwnerId == userId);

        if (form == null)
            return NotFound(new { message = "Form not found" });

        return Ok(MapToDto(form));
    }

    [HttpPost]
    public async Task<IActionResult> CreateForm([FromBody] FormCreateDto dto)
    {
        var userId = GetUserId();

        var form = new Form
        {
            Title = dto.Title,
            Description = dto.Description,
            OwnerId = userId,
            IsPublic = dto.IsPublic,
            AllowMultipleSubmissions = dto.AllowMultipleSubmissions,
            ShowCorrectAnswers = dto.ShowCorrectAnswers,
            CollectEmail = dto.CollectEmail,
            Status = "draft"
        };

        foreach (var qDto in dto.Questions)
        {
            form.Questions.Add(MapQuestion(qDto));
        }

        _context.Forms.Add(form);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetForm), new { id = form.Id }, MapToDto(form));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateForm(Guid id, [FromBody] FormCreateDto dto)
    {
        var userId = GetUserId();

        var form = await _context.Forms
            .Include(f => f.Questions)
                .ThenInclude(q => q.Options)
            .FirstOrDefaultAsync(f => f.Id == id && f.OwnerId == userId);

        if (form == null)
            return NotFound(new { message = "Form not found" });

        form.Title = dto.Title;
        form.Description = dto.Description;
        form.IsPublic = dto.IsPublic;
        form.AllowMultipleSubmissions = dto.AllowMultipleSubmissions;
        form.ShowCorrectAnswers = dto.ShowCorrectAnswers;
        form.CollectEmail = dto.CollectEmail;
        form.UpdatedAt = DateTime.UtcNow;

        _context.Questions.RemoveRange(form.Questions);

        foreach (var qDto in dto.Questions)
        {
            var question = MapQuestion(qDto);
            question.FormId = form.Id;
            form.Questions.Add(question);
        }

        await _context.SaveChangesAsync();

        return Ok(MapToDto(form));
    }

    [HttpPost("{id}/thumbnail")]
    [RequestSizeLimit(5 * 1024 * 1024)]
    public async Task<IActionResult> UploadThumbnail(Guid id, IFormFile file)
    {
        if (!_blobStorage.IsConfigured)
            return StatusCode(503, new { message = "Azure Blob Storage is not configured" });

        if (file == null || file.Length == 0)
            return BadRequest(new { message = "No file provided" });

        var allowedTypes = new[] { "image/jpeg", "image/png", "image/webp", "image/gif" };
        if (!allowedTypes.Contains(file.ContentType))
            return BadRequest(new { message = "Only JPEG, PNG, WebP and GIF images are allowed" });

        var userId = GetUserId();
        var form = await _context.Forms.FirstOrDefaultAsync(f => f.Id == id && f.OwnerId == userId);
        if (form == null)
            return NotFound(new { message = "Form not found" });

        if (!string.IsNullOrEmpty(form.ThumbnailUrl))
            await _blobStorage.DeleteAsync(form.ThumbnailUrl);

        var extension = Path.GetExtension(file.FileName);
        if (string.IsNullOrEmpty(extension))
            extension = file.ContentType switch
            {
                "image/png" => ".png",
                "image/webp" => ".webp",
                "image/gif" => ".gif",
                _ => ".jpg"
            };

        var blobPath = $"forms/{userId}/{id}{extension}";

        await using var stream = file.OpenReadStream();
        var url = await _blobStorage.UploadAsync(stream, file.ContentType, blobPath);

        form.ThumbnailUrl = url;
        form.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new { thumbnailUrl = url });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteForm(Guid id)
    {
        var userId = GetUserId();

        var form = await _context.Forms.FirstOrDefaultAsync(f => f.Id == id && f.OwnerId == userId);

        if (form == null)
            return NotFound(new { message = "Form not found" });

        if (!string.IsNullOrEmpty(form.ThumbnailUrl))
            await _blobStorage.DeleteAsync(form.ThumbnailUrl);

        _context.Forms.Remove(form);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateStatusDto dto)
    {
        var userId = GetUserId();

        var form = await _context.Forms.FirstOrDefaultAsync(f => f.Id == id && f.OwnerId == userId);

        if (form == null)
            return NotFound(new { message = "Form not found" });

        if (dto.Status != "draft" && dto.Status != "published" && dto.Status != "closed")
            return BadRequest(new { message = "Invalid status. Use: draft, published, closed" });

        form.Status = dto.Status;
        form.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Status updated", status = form.Status });
    }

    private static Question MapQuestion(QuestionCreateDto qDto)
    {
        var question = new Question
        {
            Title = qDto.Title,
            Type = qDto.Type,
            OrderIndex = qDto.OrderIndex,
            IsRequired = qDto.IsRequired
        };

        foreach (var oDto in qDto.Options)
        {
            question.Options.Add(new QuestionOption
            {
                OptionText = oDto.OptionText,
                OrderIndex = oDto.OrderIndex,
                IsCorrect = oDto.IsCorrect
            });
        }

        return question;
    }

    private static FormResponseDto MapToDto(Form form)
    {
        return new FormResponseDto
        {
            Id = form.Id,
            Title = form.Title,
            Description = form.Description,
            ThumbnailUrl = form.ThumbnailUrl,
            OwnerId = form.OwnerId,
            Status = form.Status,
            IsPublic = form.IsPublic,
            AllowMultipleSubmissions = form.AllowMultipleSubmissions,
            ShowCorrectAnswers = form.ShowCorrectAnswers,
            CollectEmail = form.CollectEmail,
            CreatedAt = form.CreatedAt,
            UpdatedAt = form.UpdatedAt,
            Questions = form.Questions.OrderBy(q => q.OrderIndex).Select(q => new QuestionResponseDto
            {
                Id = q.Id,
                Title = q.Title,
                Type = q.Type,
                OrderIndex = q.OrderIndex,
                IsRequired = q.IsRequired,
                Options = q.Options.OrderBy(o => o.OrderIndex).Select(o => new OptionResponseDto
                {
                    Id = o.Id,
                    OptionText = o.OptionText,
                    OrderIndex = o.OrderIndex,
                    IsCorrect = o.IsCorrect
                }).ToList()
            }).ToList()
        };
    }
}

public class UpdateStatusDto
{
    public string Status { get; set; } = string.Empty;
}
