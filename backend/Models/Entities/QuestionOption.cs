using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FormBuilderAPI.Models.Entities;

public class QuestionOption
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid QuestionId { get; set; }

    [ForeignKey(nameof(QuestionId))]
    public Question Question { get; set; } = null!;

    [Required]
    [MaxLength(500)]
    public string OptionText { get; set; } = string.Empty;

    public int OrderIndex { get; set; }

    public bool IsCorrect { get; set; } = false;

    // Navigation properties
    public ICollection<AnswerOption> AnswerOptions { get; set; } = new List<AnswerOption>();
}
