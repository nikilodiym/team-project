using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FormBuilderAPI.Data;
using FormBuilderAPI.Models.Entities;
using FormBuilderAPI.Models.DTOs.Forms;
using FormBuilderAPI.Models.DTOs.Responses;

namespace FormBuilderAPI.Controllers;

[ApiController]
[Route("api/public")]
public class PublicController : ControllerBase
{
    private readonly AppDbContext _context;

    public PublicController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("forms/{id}")]
    public async Task<IActionResult> GetPublicForm(Guid id)
    {
        var form = await _context.Forms
            .Include(f => f.Questions)
                .ThenInclude(q => q.Options)
            .FirstOrDefaultAsync(f => f.Id == id && f.Status == "published" && f.IsPublic);

        if (form == null)
            return NotFound(new { message = "Form not found or not published" });

        var dto = new FormResponseDto
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
                    IsCorrect = false // hide correct answers in public view
                }).ToList()
            }).ToList()
        };

        return Ok(dto);
    }

    [HttpPost("forms/{id}/submit")]
    public async Task<IActionResult> SubmitResponse(Guid id, [FromBody] SubmitResponseDto dto)
    {
        var form = await _context.Forms
            .Include(f => f.Questions)
                .ThenInclude(q => q.Options)
            .FirstOrDefaultAsync(f => f.Id == id && f.Status == "published");

        if (form == null)
            return NotFound(new { message = "Form not found or not published" });

        if (form.CollectEmail && string.IsNullOrWhiteSpace(dto.RespondentEmail))
            return BadRequest(new { message = "Email is required" });

        if (!form.AllowMultipleSubmissions && !string.IsNullOrWhiteSpace(dto.RespondentEmail))
        {
            var existingResponse = await _context.Responses
                .AnyAsync(r => r.FormId == id && r.RespondentEmail == dto.RespondentEmail);

            if (existingResponse)
                return BadRequest(new { message = "You have already submitted this form" });
        }

        var response = new Response
        {
            FormId = id,
            RespondentEmail = dto.RespondentEmail,
            IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString()
        };

        decimal score = 0;
        decimal maxScore = 0;

        foreach (var answerDto in dto.Answers)
        {
            var question = form.Questions.FirstOrDefault(q => q.Id == answerDto.QuestionId);
            if (question == null) continue;

            var answer = new Answer
            {
                QuestionId = answerDto.QuestionId,
                AnswerText = answerDto.AnswerText
            };

            if (answerDto.SelectedOptionIds != null && answerDto.SelectedOptionIds.Any())
            {
                foreach (var optionId in answerDto.SelectedOptionIds)
                {
                    var option = question.Options.FirstOrDefault(o => o.Id == optionId);
                    if (option != null)
                    {
                        answer.AnswerOptions.Add(new AnswerOption
                        {
                            OptionId = optionId
                        });
                    }
                }
            }

            response.Answers.Add(answer);

            // Calculate score
            if (question.Type != "text" && question.Options.Any(o => o.IsCorrect))
            {
                maxScore++;

                var correctOptionIds = question.Options.Where(o => o.IsCorrect).Select(o => o.Id).ToHashSet();
                var selectedOptionIds = answerDto.SelectedOptionIds?.ToHashSet() ?? new HashSet<Guid>();

                if (correctOptionIds.SetEquals(selectedOptionIds))
                {
                    score++;
                }
            }
        }

        if (maxScore > 0)
        {
            response.Score = score;
            response.MaxScore = maxScore;
        }

        _context.Responses.Add(response);
        await _context.SaveChangesAsync();

        var result = new
        {
            id = response.Id,
            message = "Response submitted successfully",
            score = response.Score,
            maxScore = response.MaxScore,
            showCorrectAnswers = form.ShowCorrectAnswers
        };

        return Ok(result);
    }
}
