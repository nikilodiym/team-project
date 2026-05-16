using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using FormBuilderAPI.Data;
using FormBuilderAPI.Models.DTOs.Responses;

namespace FormBuilderAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ResponsesController : ControllerBase
{
    private readonly AppDbContext _context;

    public ResponsesController(AppDbContext context)
    {
        _context = context;
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.Parse(userIdClaim!);
    }

    [HttpGet]
    public async Task<IActionResult> GetResponses([FromQuery] Guid? formId)
    {
        var userId = GetUserId();

        var query = _context.Responses
            .Include(r => r.Form)
            .Include(r => r.Answers)
                .ThenInclude(a => a.Question)
            .Include(r => r.Answers)
                .ThenInclude(a => a.AnswerOptions)
                    .ThenInclude(ao => ao.Option)
            .Where(r => r.Form.OwnerId == userId);

        if (formId.HasValue)
        {
            query = query.Where(r => r.FormId == formId.Value);
        }

        var responses = await query
            .OrderByDescending(r => r.SubmittedAt)
            .Select(r => new ResponseResultDto
            {
                Id = r.Id,
                FormId = r.FormId,
                FormTitle = r.Form.Title,
                RespondentEmail = r.RespondentEmail,
                Score = r.Score,
                MaxScore = r.MaxScore,
                SubmittedAt = r.SubmittedAt,
                Answers = r.Answers.Select(a => new AnswerResultDto
                {
                    QuestionId = a.QuestionId,
                    QuestionTitle = a.Question.Title,
                    QuestionType = a.Question.Type,
                    AnswerText = a.AnswerText,
                    SelectedOptions = a.AnswerOptions.Select(ao => ao.Option.OptionText).ToList()
                }).ToList()
            })
            .ToListAsync();

        return Ok(responses);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetResponse(Guid id)
    {
        var userId = GetUserId();

        var response = await _context.Responses
            .Include(r => r.Form)
            .Include(r => r.Answers)
                .ThenInclude(a => a.Question)
            .Include(r => r.Answers)
                .ThenInclude(a => a.AnswerOptions)
                    .ThenInclude(ao => ao.Option)
            .FirstOrDefaultAsync(r => r.Id == id && r.Form.OwnerId == userId);

        if (response == null)
            return NotFound(new { message = "Response not found" });

        var dto = new ResponseResultDto
        {
            Id = response.Id,
            FormId = response.FormId,
            FormTitle = response.Form.Title,
            RespondentEmail = response.RespondentEmail,
            Score = response.Score,
            MaxScore = response.MaxScore,
            SubmittedAt = response.SubmittedAt,
            Answers = response.Answers.Select(a => new AnswerResultDto
            {
                QuestionId = a.QuestionId,
                QuestionTitle = a.Question.Title,
                QuestionType = a.Question.Type,
                AnswerText = a.AnswerText,
                SelectedOptions = a.AnswerOptions.Select(ao => ao.Option.OptionText).ToList()
            }).ToList()
        };

        return Ok(dto);
    }

    [HttpGet("stats/{formId}")]
    public async Task<IActionResult> GetStats(Guid formId)
    {
        var userId = GetUserId();

        var form = await _context.Forms.FirstOrDefaultAsync(f => f.Id == formId && f.OwnerId == userId);
        if (form == null)
            return NotFound(new { message = "Form not found" });

        var responses = await _context.Responses
            .Where(r => r.FormId == formId)
            .ToListAsync();

        var stats = new
        {
            formId = formId,
            formTitle = form.Title,
            totalResponses = responses.Count,
            averageScore = responses.Where(r => r.Score.HasValue).Any()
                ? responses.Where(r => r.Score.HasValue).Average(r => r.Score!.Value)
                : 0,
            maxPossibleScore = responses.FirstOrDefault()?.MaxScore ?? 0,
            lastResponseAt = responses.OrderByDescending(r => r.SubmittedAt).FirstOrDefault()?.SubmittedAt
        };

        return Ok(stats);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteResponse(Guid id)
    {
        var userId = GetUserId();

        var response = await _context.Responses
            .Include(r => r.Form)
            .FirstOrDefaultAsync(r => r.Id == id && r.Form.OwnerId == userId);

        if (response == null)
            return NotFound(new { message = "Response not found" });

        _context.Responses.Remove(response);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
