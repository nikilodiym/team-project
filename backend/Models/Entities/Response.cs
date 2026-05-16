using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FormBuilderAPI.Models.Entities;

public class Response
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid FormId { get; set; }

    [ForeignKey(nameof(FormId))]
    public Form Form { get; set; } = null!;

    [MaxLength(255)]
    public string? RespondentEmail { get; set; }

    public Guid? RespondentId { get; set; }

    [ForeignKey(nameof(RespondentId))]
    public User? Respondent { get; set; }

    [Column(TypeName = "decimal(5,2)")]
    public decimal? Score { get; set; }

    [Column(TypeName = "decimal(5,2)")]
    public decimal? MaxScore { get; set; }

    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

    [MaxLength(50)]
    public string? IpAddress { get; set; }

    // Navigation properties
    public ICollection<Answer> Answers { get; set; } = new List<Answer>();
}
