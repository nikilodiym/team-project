using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FormBuilderAPI.Models.Entities;

public class Answer
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid ResponseId { get; set; }

    [ForeignKey(nameof(ResponseId))]
    public Response Response { get; set; } = null!;

    [Required]
    public Guid QuestionId { get; set; }

    [ForeignKey(nameof(QuestionId))]
    public Question Question { get; set; } = null!;

    public string? AnswerText { get; set; }

    // Navigation properties
    public ICollection<AnswerOption> AnswerOptions { get; set; } = new List<AnswerOption>();
}
