using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using ProjectManagement.Api.Domain;

namespace ProjectManagement.Api.Data
{
    public class AppDbContext : IdentityDbContext<ApplicationUser>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Project> Projects { get; set; }
        public DbSet<Board> Boards { get; set; }
        public DbSet<TaskItem> Tasks { get; set; }
        public DbSet<ProjectMember> ProjectMembers { get; set; }
        public DbSet<ActivityLog> ActivityLogs { get; set; }
        public DbSet<Comment> Comments { get; set; }
        public DbSet<TaskAttachment> TaskAttachments { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);
            
            builder.Entity<ProjectMember>()
                .HasKey(pm => new { pm.ProjectId, pm.UserId });

            builder.Entity<Project>()
                .HasOne(p => p.Owner)
                .WithMany(u => u.OwnedProjects)
                .HasForeignKey(p => p.OwnerId)
                .IsRequired(true)
                .OnDelete(DeleteBehavior.Restrict);
            
            builder.Entity<ProjectMember>()
                .HasOne(pm => pm.Project)
                .WithMany(p => p.Members)
                .HasForeignKey(pm => pm.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<ProjectMember>()
                .HasOne(pm => pm.User)
                .WithMany(u => u.ProjectMemberships)
                .HasForeignKey(pm => pm.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Board>()
                .HasOne(b => b.Project)
                .WithMany(p => p.Boards)
                .HasForeignKey(b => b.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<TaskItem>()
                .HasOne(t => t.Board)
                .WithMany(b => b.Tasks)
                .HasForeignKey(t => t.BoardId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<ActivityLog>()
                .HasOne(a => a.Project)
                .WithMany(p => p.ActivityLogs)
                .HasForeignKey(a => a.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);
            
            builder.Entity<ActivityLog>()
                .HasOne(a => a.User)
                .WithMany()
                .HasForeignKey(a => a.UserId)
                .OnDelete(DeleteBehavior.SetNull);
            
            builder.Entity<Project>()
                .HasIndex(p => p.InviteCode)
                .IsUnique();
        }
    }
}