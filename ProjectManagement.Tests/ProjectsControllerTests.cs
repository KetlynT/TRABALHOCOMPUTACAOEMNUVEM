using Xunit;
using Microsoft.EntityFrameworkCore;
using ProjectManagement.Api.Data;
using ProjectManagement.Api.Controllers;
using ProjectManagement.Api.Domain;
using System;

public class ProjectsControllerTests
{
    private AppDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString()).Options;
        return new AppDbContext(options);
    }

    [Fact]
    public async Task CanCreateAndGetProject()
    {
        var db = CreateDbContext();
        var controller = new ProjectsController(db);
        var proj = new Project { Id = Guid.NewGuid(), Name = "Test Project" };
        var createResult = await controller.Create(proj);
        var listResult = await controller.GetAll() as Microsoft.AspNetCore.Mvc.OkObjectResult;
        Assert.NotNull(listResult);
        var arr = listResult.Value as List<Project>;
        Assert.Single(arr);
        Assert.Equal("Test Project", arr[0].Name);
    }
}
