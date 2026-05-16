namespace FormBuilderAPI.Models.DTOs.Forms;

public class FormResponseDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ThumbnailUrl { get; set; }
    public Guid OwnerId { get; set; }
    public string Status { get; set; } = "draft";
    public bool IsPublic { get; set; }
    public bool AllowMultipleSubmissions { get; set; }
    public bool ShowCorrectAnswers { get; set; }
    public bool CollectEmail { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public List<QuestionResponseDto> Questions { get; set; } = new();
}

public class QuestionResponseDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Type { get; set; } = "radio";
    public int OrderIndex { get; set; }
    public bool IsRequired { get; set; }
    public List<OptionResponseDto> Options { get; set; } = new();
}

public class OptionResponseDto
{
    public Guid Id { get; set; }
    public string OptionText { get; set; } = string.Empty;
    public int OrderIndex { get; set; }
    public bool IsCorrect { get; set; }
}
