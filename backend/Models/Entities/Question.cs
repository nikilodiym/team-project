using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FormBuilderAPI.Models.Entities;

public class Question
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid FormId { get; set; }

    [ForeignKey(nameof(FormId))]
    public Form Form { get; set; } = null!;

    [Required]
    [MaxLength(500)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    public string Type { get; set; } = "radio"; // radio, checkbox, text

    public int OrderIndex { get; set; }

    public bool IsRequired { get; set; } = false;

    // Navigation properties
    public ICollection<QuestionOption> Options { get; set; } = new List<QuestionOption>();
    public ICollection<Answer> Answers { get; set; } = new List<Answer>();
}
