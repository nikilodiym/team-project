using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using FormBuilderAPI.Data;
using FormBuilderAPI.Helpers;
using FormBuilderAPI.Models.Entities;
using FormBuilderAPI.Models.DTOs.Templates;

namespace FormBuilderAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TemplatesController : ControllerBase
{
    private readonly AppDbContext _context;

    public TemplatesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? category)
    {
        var query = _context.Templates
            .Include(t => t.Questions)
                .ThenInclude(q => q.Options)
            .Where(t => t.IsPublic)
            .AsQueryable();

        if (!string.IsNullOrEmpty(category))
        {
            query = query.Where(t => t.Category == category);
        }

        var templates = await query
            .OrderByDescending(t => t.UsageCount)
            .Select(t => MapToResponseDto(t))
            .ToListAsync();

        return Ok(templates);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var template = await _context.Templates
            .Include(t => t.Questions)
                .ThenInclude(q => q.Options)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (template == null)
            return NotFound();

        return Ok(MapToResponseDto(template));
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] TemplateCreateDto dto)
    {
        var userId = UserClaimsHelper.GetUserId(User);
        if (userId == null)
            return Unauthorized();

        var template = new Template
        {
            Title = dto.Title,
            Description = dto.Description,
            Category = dto.Category,
            ThumbnailUrl = dto.ThumbnailUrl,
            IsPublic = dto.IsPublic,
            CreatedById = userId.Value,
            Questions = dto.Questions.Select((q, qi) => new TemplateQuestion
            {
                Title = q.Title,
                Type = q.Type,
                OrderIndex = q.OrderIndex > 0 ? q.OrderIndex : qi,
                IsRequired = q.IsRequired,
                Options = q.Options.Select((o, oi) => new TemplateOption
                {
                    OptionText = o.OptionText,
                    OrderIndex = o.OrderIndex > 0 ? o.OrderIndex : oi,
                    IsCorrect = o.IsCorrect
                }).ToList()
            }).ToList()
        };

        _context.Templates.Add(template);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = template.Id }, MapToResponseDto(template));
    }

    [Authorize]
    [HttpPost("{id}/use")]
    public async Task<IActionResult> UseTemplate(Guid id)
    {
        var userId = UserClaimsHelper.GetUserId(User);
        if (userId == null)
            return Unauthorized();

        var template = await _context.Templates
            .Include(t => t.Questions)
                .ThenInclude(q => q.Options)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (template == null)
            return NotFound();

        var form = new Form
        {
            Title = template.Title,
            Description = template.Description,
            OwnerId = userId.Value,
            ThumbnailUrl = template.ThumbnailUrl,
            Status = "draft",
            Questions = template.Questions.Select(q => new Question
            {
                Title = q.Title,
                Type = q.Type,
                OrderIndex = q.OrderIndex,
                IsRequired = q.IsRequired,
                Options = q.Options.Select(o => new QuestionOption
                {
                    OptionText = o.OptionText,
                    OrderIndex = o.OrderIndex,
                    IsCorrect = o.IsCorrect
                }).ToList()
            }).ToList()
        };

        _context.Forms.Add(form);
        template.UsageCount++;
        await _context.SaveChangesAsync();

        return Ok(new { formId = form.Id, message = "Form created from template" });
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userId = UserClaimsHelper.GetUserId(User);
        if (userId == null)
            return Unauthorized();

        var template = await _context.Templates.FindAsync(id);
        if (template == null)
            return NotFound();

        if (template.CreatedById != userId.Value)
            return Forbid();

        _context.Templates.Remove(template);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private static TemplateResponseDto MapToResponseDto(Template t) => new()
    {
        Id = t.Id,
        Title = t.Title,
        Description = t.Description,
        Category = t.Category,
        ThumbnailUrl = t.ThumbnailUrl,
        CreatedById = t.CreatedById,
        IsPublic = t.IsPublic,
        UsageCount = t.UsageCount,
        CreatedAt = t.CreatedAt,
        Questions = t.Questions.OrderBy(q => q.OrderIndex).Select(q => new TemplateQuestionResponseDto
        {
            Id = q.Id,
            Title = q.Title,
            Type = q.Type,
            OrderIndex = q.OrderIndex,
            IsRequired = q.IsRequired,
            Options = q.Options.OrderBy(o => o.OrderIndex).Select(o => new TemplateOptionResponseDto
            {
                Id = o.Id,
                OptionText = o.OptionText,
                OrderIndex = o.OrderIndex,
                IsCorrect = o.IsCorrect
            }).ToList()
        }).ToList()
    };
}
