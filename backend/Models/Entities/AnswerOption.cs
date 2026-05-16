using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FormBuilderAPI.Models.Entities;

public class AnswerOption
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid AnswerId { get; set; }

    [ForeignKey(nameof(AnswerId))]
    public Answer Answer { get; set; } = null!;

    [Required]
    public Guid OptionId { get; set; }

    [ForeignKey(nameof(OptionId))]
    public QuestionOption Option { get; set; } = null!;
}
