using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FormBuilderAPI.Models.Entities;

public class Template
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [MaxLength(255)]
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    [MaxLength(50)]
    public string? Category { get; set; } // survey, quiz, registration, feedback

    [MaxLength(500)]
    public string? ThumbnailUrl { get; set; }

    public Guid? CreatedById { get; set; }

    [ForeignKey(nameof(CreatedById))]
    public User? CreatedBy { get; set; }

    public bool IsPublic { get; set; } = true;

    public int UsageCount { get; set; } = 0;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ICollection<TemplateQuestion> Questions { get; set; } = new List<TemplateQuestion>();
}

public class TemplateQuestion
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid TemplateId { get; set; }

    [ForeignKey(nameof(TemplateId))]
    public Template Template { get; set; } = null!;

    [Required]
    [MaxLength(500)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    public string Type { get; set; } = "radio";

    public int OrderIndex { get; set; }

    public bool IsRequired { get; set; } = false;

    // Navigation properties
    public ICollection<TemplateOption> Options { get; set; } = new List<TemplateOption>();
}

public class TemplateOption
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid TemplateQuestionId { get; set; }

    [ForeignKey(nameof(TemplateQuestionId))]
    public TemplateQuestion TemplateQuestion { get; set; } = null!;

    [Required]
    [MaxLength(500)]
    public string OptionText { get; set; } = string.Empty;

    public int OrderIndex { get; set; }

    public bool IsCorrect { get; set; } = false;
}
