using Microsoft.EntityFrameworkCore;
using FormBuilderAPI.Models.Entities;

namespace FormBuilderAPI.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Form> Forms { get; set; }
    public DbSet<Question> Questions { get; set; }
    public DbSet<QuestionOption> QuestionOptions { get; set; }
    public DbSet<Response> Responses { get; set; }
    public DbSet<Answer> Answers { get; set; }
    public DbSet<AnswerOption> AnswerOptions { get; set; }
    public DbSet<Template> Templates { get; set; }
    public DbSet<TemplateQuestion> TemplateQuestions { get; set; }
    public DbSet<TemplateOption> TemplateOptions { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(e => e.Email).IsUnique();
        });

        // Form
        modelBuilder.Entity<Form>(entity =>
        {
            entity.HasIndex(e => e.OwnerId);
            entity.HasIndex(e => e.Status);

            entity.HasOne(f => f.Owner)
                .WithMany(u => u.Forms)
                .HasForeignKey(f => f.OwnerId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Question
        modelBuilder.Entity<Question>(entity =>
        {
            entity.HasIndex(e => e.FormId);

            entity.HasOne(q => q.Form)
                .WithMany(f => f.Questions)
                .HasForeignKey(q => q.FormId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // QuestionOption
        modelBuilder.Entity<QuestionOption>(entity =>
        {
            entity.HasIndex(e => e.QuestionId);

            entity.HasOne(o => o.Question)
                .WithMany(q => q.Options)
                .HasForeignKey(o => o.QuestionId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Response
        modelBuilder.Entity<Response>(entity =>
        {
            entity.HasIndex(e => e.FormId);
            entity.HasIndex(e => e.RespondentId);

            entity.HasOne(r => r.Form)
                .WithMany(f => f.Responses)
                .HasForeignKey(r => r.FormId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(r => r.Respondent)
                .WithMany(u => u.Responses)
                .HasForeignKey(r => r.RespondentId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // Answer
        modelBuilder.Entity<Answer>(entity =>
        {
            entity.HasIndex(e => e.ResponseId);

            entity.HasOne(a => a.Response)
                .WithMany(r => r.Answers)
                .HasForeignKey(a => a.ResponseId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(a => a.Question)
                .WithMany(q => q.Answers)
                .HasForeignKey(a => a.QuestionId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        // AnswerOption
        modelBuilder.Entity<AnswerOption>(entity =>
        {
            entity.HasOne(ao => ao.Answer)
                .WithMany(a => a.AnswerOptions)
                .HasForeignKey(ao => ao.AnswerId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(ao => ao.Option)
                .WithMany(o => o.AnswerOptions)
                .HasForeignKey(ao => ao.OptionId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        // Template
        modelBuilder.Entity<Template>(entity =>
        {
            entity.HasIndex(e => e.Category);

            entity.HasOne(t => t.CreatedBy)
                .WithMany()
                .HasForeignKey(t => t.CreatedById)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // TemplateQuestion
        modelBuilder.Entity<TemplateQuestion>(entity =>
        {
            entity.HasOne(q => q.Template)
                .WithMany(t => t.Questions)
                .HasForeignKey(q => q.TemplateId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // TemplateOption
        modelBuilder.Entity<TemplateOption>(entity =>
        {
            entity.HasOne(o => o.TemplateQuestion)
                .WithMany(q => q.Options)
                .HasForeignKey(o => o.TemplateQuestionId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
