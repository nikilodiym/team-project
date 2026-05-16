using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using FormBuilderAPI.Data;
using FormBuilderAPI.Models.Entities;
using FormBuilderAPI.Models.DTOs.Forms;

namespace FormBuilderAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FormsController : ControllerBase
{
    private readonly AppDbContext _context;

    public FormsController(AppDbContext context)
    {
        _context = context;
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.Parse(userIdClaim!);
    }

    [HttpGet]
    public async Task<IActionResult> GetMyForms()
    {
        var userId = GetUserId();

        var forms = await _context.Forms
            .Where(f => f.OwnerId == userId)
            .OrderByDescending(f => f.CreatedAt)
            .Select(f => new FormResponseDto
            {
                Id = f.Id,
                Title = f.Title,
                Description = f.Description,
                OwnerId = f.OwnerId,
                Status = f.Status,
                IsPublic = f.IsPublic,
                AllowMultipleSubmissions = f.AllowMultipleSubmissions,
                ShowCorrectAnswers = f.ShowCorrectAnswers,
                CollectEmail = f.CollectEmail,
                CreatedAt = f.CreatedAt,
                UpdatedAt = f.UpdatedAt,
                Questions = f.Questions.OrderBy(q => q.OrderIndex).Select(q => new QuestionResponseDto
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

        var dto = MapToDto(form);
        return Ok(dto);
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

            form.Questions.Add(question);
        }

        _context.Forms.Add(form);
        await _context.SaveChangesAsync();

        var result = MapToDto(form);
        return CreatedAtAction(nameof(GetForm), new { id = form.Id }, result);
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
            var question = new Question
            {
                FormId = form.Id,
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

            form.Questions.Add(question);
        }

        await _context.SaveChangesAsync();

        var result = MapToDto(form);
        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteForm(Guid id)
    {
        var userId = GetUserId();

        var form = await _context.Forms.FirstOrDefaultAsync(f => f.Id == id && f.OwnerId == userId);

        if (form == null)
            return NotFound(new { message = "Form not found" });

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

    private static FormResponseDto MapToDto(Form form)
    {
        return new FormResponseDto
        {
            Id = form.Id,
            Title = form.Title,
            Description = form.Description,
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
