using System.Threading.Tasks;
using Xunit;
using ProjectManagement.Api.Data;
using Microsoft.EntityFrameworkCore;
using ProjectManagement.Api.Controllers;
using ProjectManagement.Api.Domain;
using ProjectManagement.Api.Services;
using Microsoft.AspNetCore.Mvc;

public class ProjectsAndTasksTests
{
    private AppDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: System.Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(options);
    }

    [Fact]
    public async Task CanCreateProjectAndTaskAndAttachment()
    {
        var db = CreateDbContext();
        var activity = new ActivityService(db);

        // create project
        var proj = new Project { Id = Guid.NewGuid(), Name = "TstProject" };
        db.Projects.Add(proj);
        await db.SaveChangesAsync();

        // create board
        var board = new Board { Id = Guid.NewGuid(), Name = "To Do", ProjectId = proj.Id, Project = proj };
        db.Boards.Add(board);
        await db.SaveChangesAsync();

        // create task
        var task = new TaskItem { Id = Guid.NewGuid(), Title = "t1", BoardId = board.Id, Board = board };
        db.Tasks.Add(task);
        await db.SaveChangesAsync();

        // create attachment
        var att = new TaskAttachment { Id = Guid.NewGuid(), TaskItemId = task.Id, FileName = "f.txt", FilePath = "/uploads/f.txt" };
        db.TaskAttachments.Add(att);
        await db.SaveChangesAsync();

        // assert
        var savedProj = await db.Projects.Include(p => p.Boards).FirstOrDefaultAsync(p => p.Id == proj.Id);
        Assert.NotNull(savedProj);
        var savedTask = await db.Tasks.Include(t => t.Comments).FirstOrDefaultAsync(t => t.Id == task.Id);
        Assert.NotNull(savedTask);
        var savedAtt = await db.TaskAttachments.FirstOrDefaultAsync(a => a.Id == att.Id);
        Assert.NotNull(savedAtt);
    }
}
