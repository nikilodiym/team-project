using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FormBuilderAPI.Data;
using FormBuilderAPI.Models.DTOs.Forms;

namespace FormBuilderAPI.Controllers;

[ApiController]
[Route("api/public/forms")]
public class PublicFormsController : ControllerBase
{
    private readonly AppDbContext _context;

    public PublicFormsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetPublicForm(Guid id)
    {
        var form = await _context.Forms
            .Include(f => f.Questions)
                .ThenInclude(q => q.Options)
            .FirstOrDefaultAsync(f => f.Id == id && f.Status == "published" && f.IsPublic);

        if (form == null)
            return NotFound(new { message = "Form not found or not published" });

        var dto = new PublicFormDto
        {
            Id = form.Id,
            Title = form.Title,
            Description = form.Description,
            CollectEmail = form.CollectEmail,
            Questions = form.Questions.OrderBy(q => q.OrderIndex).Select(q => new PublicQuestionDto
            {
                Id = q.Id,
                Title = q.Title,
                Type = q.Type,
                IsRequired = q.IsRequired,
                Options = q.Options.OrderBy(o => o.OrderIndex).Select(o => new PublicOptionDto
                {
                    Id = o.Id,
                    OptionText = o.OptionText
                }).ToList()
            }).ToList()
        };

        return Ok(dto);
    }
}

public class PublicFormDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool CollectEmail { get; set; }
    public List<PublicQuestionDto> Questions { get; set; } = new();
}

public class PublicQuestionDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public bool IsRequired { get; set; }
    public List<PublicOptionDto> Options { get; set; } = new();
}

public class PublicOptionDto
{
    public Guid Id { get; set; }
    public string OptionText { get; set; } = string.Empty;
}
