using System.ComponentModel.DataAnnotations;

namespace FormBuilderAPI.Models.DTOs.Responses;

public class SubmitResponseDto
{
    public string? RespondentEmail { get; set; }

    [Required]
    public List<AnswerSubmitDto> Answers { get; set; } = new();
}

public class AnswerSubmitDto
{
    [Required]
    public Guid QuestionId { get; set; }

    public string? AnswerText { get; set; }

    public List<Guid>? SelectedOptionIds { get; set; }
}
