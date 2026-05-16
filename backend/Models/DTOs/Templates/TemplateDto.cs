using System.ComponentModel.DataAnnotations;

namespace FormBuilderAPI.Models.DTOs.Templates;

public class TemplateCreateDto
{
    [Required]
    [MaxLength(255)]
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    [MaxLength(50)]
    public string? Category { get; set; }

    [MaxLength(500)]
    public string? ThumbnailUrl { get; set; }

    public bool IsPublic { get; set; } = true;

    public List<TemplateQuestionDto> Questions { get; set; } = new();
}

public class TemplateQuestionDto
{
    [Required]
    [MaxLength(500)]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Type { get; set; } = "radio";

    public int OrderIndex { get; set; }

    public bool IsRequired { get; set; } = false;

    public List<TemplateOptionDto> Options { get; set; } = new();
}

public class TemplateOptionDto
{
    [Required]
    [MaxLength(500)]
    public string OptionText { get; set; } = string.Empty;

    public int OrderIndex { get; set; }

    public bool IsCorrect { get; set; } = false;
}

public class TemplateResponseDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Category { get; set; }
    public string? ThumbnailUrl { get; set; }
    public Guid? CreatedById { get; set; }
    public bool IsPublic { get; set; }
    public int UsageCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<TemplateQuestionResponseDto> Questions { get; set; } = new();
}

public class TemplateQuestionResponseDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Type { get; set; } = "radio";
    public int OrderIndex { get; set; }
    public bool IsRequired { get; set; }
    public List<TemplateOptionResponseDto> Options { get; set; } = new();
}

public class TemplateOptionResponseDto
{
    public Guid Id { get; set; }
    public string OptionText { get; set; } = string.Empty;
    public int OrderIndex { get; set; }
    public bool IsCorrect { get; set; }
}
