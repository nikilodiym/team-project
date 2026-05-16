using System.ComponentModel.DataAnnotations;

namespace FormBuilderAPI.Models.DTOs.Forms;

public class FormCreateDto
{
    [Required]
    [MaxLength(255)]
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public bool IsPublic { get; set; } = true;

    public bool AllowMultipleSubmissions { get; set; } = true;

    public bool ShowCorrectAnswers { get; set; } = false;

    public bool CollectEmail { get; set; } = true;

    public List<QuestionCreateDto> Questions { get; set; } = new();
}

public class QuestionCreateDto
{
    [Required]
    [MaxLength(500)]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Type { get; set; } = "radio";

    public int OrderIndex { get; set; }

    public bool IsRequired { get; set; } = false;

    public List<OptionCreateDto> Options { get; set; } = new();
}

public class OptionCreateDto
{
    [Required]
    [MaxLength(500)]
    public string OptionText { get; set; } = string.Empty;

    public int OrderIndex { get; set; }

    public bool IsCorrect { get; set; } = false;
}
