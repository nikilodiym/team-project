namespace FormBuilderAPI.Models.DTOs.Responses;

public class ResponseResultDto
{
    public Guid Id { get; set; }
    public Guid FormId { get; set; }
    public string FormTitle { get; set; } = string.Empty;
    public string? RespondentEmail { get; set; }
    public decimal? Score { get; set; }
    public decimal? MaxScore { get; set; }
    public DateTime SubmittedAt { get; set; }
    public List<AnswerResultDto> Answers { get; set; } = new();
}

public class AnswerResultDto
{
    public Guid QuestionId { get; set; }
    public string QuestionTitle { get; set; } = string.Empty;
    public string QuestionType { get; set; } = string.Empty;
    public string? AnswerText { get; set; }
    public List<string> SelectedOptions { get; set; } = new();
    public bool? IsCorrect { get; set; }
}
