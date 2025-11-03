using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using ProjectManagement.Api.Domain;

namespace ProjectManagement.Api.Data;
public class AppDbContext : IdentityDbContext<ApplicationUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) {}

    public DbSet<Project> Projects => Set<Project>();
    public DbSet<Board> Boards => Set<Board>();
    public DbSet<TaskItem> Tasks => Set<TaskItem>();
    public DbSet<Comment> Comments => Set<Comment>();
    public DbSet<ActivityLog> ActivityLogs => Set<ActivityLog>();
    public DbSet<TaskAttachment> TaskAttachments => Set<TaskAttachment>();
    public DbSet<ProjectMember> ProjectMembers => Set<ProjectMember>();


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Project>()
            .HasMany(p => p.Boards)
            .WithOne(b => b.Project)
            .HasForeignKey(b => b.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Board>()
            .HasMany(b => b.Tasks)
            .WithOne(t => t.Board)
            .HasForeignKey(t => t.BoardId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<TaskItem>()
            .HasMany(t => t.Comments)
            .WithOne(c => c.TaskItem)
            .HasForeignKey(c => c.TaskItemId)
            .OnDelete(DeleteBehavior.Cascade);
        
        modelBuilder.Entity<TaskItem>()
            .HasMany(t => t.Attachments)
            .WithOne(a => a.TaskItem)
            .HasForeignKey(a => a.TaskItemId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ProjectMember>()
            .HasKey(pm => new { pm.ProjectId, pm.UserId });

        modelBuilder.Entity<ProjectMember>()
            .HasOne(pm => pm.Project)
            .WithMany(p => p.Members)
            .HasForeignKey(pm => pm.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ProjectMember>()
            .HasOne(pm => pm.User)
            .WithMany(u => u.ProjectMemberships)
            .HasForeignKey(pm => pm.UserId)
            .OnDelete(DeleteBehavior.Cascade);
        
        modelBuilder.Entity<Project>()
            .HasIndex(p => p.InviteCode)
            .IsUnique();
    }
}