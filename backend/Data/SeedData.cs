
using Microsoft.AspNetCore.Identity;
using ProjectManagement.Api.Domain;

namespace ProjectManagement.Api.Data;
public static class SeedData
{
    public static async Task InitializeAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        // usuarios
        if (!userManager.Users.Any())
        {
            var u1 = new ApplicationUser { UserName = "ketlyn@example.com", Email = "ketlyn@example.com", FullName = "Kétlyn" };
            await userManager.CreateAsync(u1, "password");
            var u2 = new ApplicationUser { UserName = "maysa@example.com", Email = "maysa@example.com", FullName = "Maysa" };
            await userManager.CreateAsync(u2, "password");
            var u3 = new ApplicationUser { UserName = "izabelly@example.com", Email = "izabelly@example.com", FullName = "Izabelly" };
            await userManager.CreateAsync(u3, "password");
        }

        // dados demo
        if (!db.Projects.Any())
        {
            var p = new Project { Id = Guid.NewGuid(), Name = "Projeto Demo", Description = "Projeto seed para demonstração" };
            var todo = new Board { Id = Guid.NewGuid(), Name = "To Do", Project = p };
            var doing = new Board { Id = Guid.NewGuid(), Name = "Doing", Project = p };
            var done = new Board { Id = Guid.NewGuid(), Name = "Done", Project = p };

            var t1 = new TaskItem { Id = Guid.NewGuid(), Title = "Criar esqueleto do backend", Description = "Endpoints iniciais", Status = "todo", Board = todo };
            var t2 = new TaskItem { Id = Guid.NewGuid(), Title = "Criar frontend", Description = "Pages iniciais", Status = "doing", Board = doing };
            var t3 = new TaskItem { Id = Guid.NewGuid(), Title = "Configurar Docker", Description = "docker-compose", Status = "done", Board = done };

            db.Projects.Add(p);
            db.Boards.AddRange(todo, doing, done);
            db.Tasks.AddRange(t1, t2, t3);

            db.ActivityLogs.Add(new ActivityLog { Id = Guid.NewGuid(), Action = "SeedCreated", ActorName = "system", Metadata = "{\"info\":\"seed data\"}" });
            await db.SaveChangesAsync();
        }
    }
}
