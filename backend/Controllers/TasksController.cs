using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjectManagement.Api.Data;
using ProjectManagement.Api.Domain;
using ProjectManagement.Api.Services;

namespace ProjectManagement.Api.Controllers;
[ApiController]
[Route("api/[controller]")]
public class TasksController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ActivityService _activity;
    public TasksController(AppDbContext db, ActivityService activity) { _db = db; _activity = activity; }

    [HttpPost]
    public async Task<IActionResult> Create(TaskItem task)
    {
        task.Id = Guid.NewGuid();
        _db.Tasks.Add(task);
        await _db.SaveChangesAsync();
        await _activity.Log("TaskCreated", actorName: User?.Identity?.Name ?? "anonymous", metadata: new { taskId = task.Id, title = task.Title });
        return CreatedAtAction(nameof(Get), new { id = task.Id }, task);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(Guid id)
    {
        var t = await _db.Tasks
            .Include(x => x.Comments)
            .Include(x => x.Board)
            .Include(x => x.Board!.Project)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (t == null) return NotFound();

        var attachments = await _db.TaskAttachments
            .Where(a => a.TaskItemId == id)
            .Select(a => new { a.Id, a.FileName, a.FilePath, a.CreatedAt, a.UploadedBy })
            .ToListAsync();

        return Ok(new { task = t, attachments });
    }


    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, TaskItem updated)
    {
        var existing = await _db.Tasks.FindAsync(id);
        if (existing == null) return NotFound();
        existing.Title = updated.Title;
        existing.Description = updated.Description;
        existing.Status = updated.Status;
        existing.BoardId = updated.BoardId;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("{id}/comments")]
    public async Task<IActionResult> AddComment(Guid id, Comment comment)
    {
        comment.Id = Guid.NewGuid();
        comment.TaskItemId = id;
        _db.Comments.Add(comment);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = id }, comment);
    }

    [HttpPost("reorder")]
    public async Task<IActionResult> Reorder([FromBody] ReorderRequest req)
    {
        // req: taskId, destinationBoardId, destinationIndex
        var task = await _db.Tasks.FindAsync(req.TaskId);
        if (task == null) return NotFound();
        task.BoardId = req.DestinationBoardId;
        task.Status = req.DestinationStatus ?? task.Status;
        await _db.SaveChangesAsync();
        await _activity.Log("TaskMoved", User?.Identity?.Name, new { taskId = req.TaskId, destBoard = req.DestinationBoardId });
        return Ok(task);
    }
    public record ReorderRequest(Guid TaskId, Guid DestinationBoardId, int DestinationIndex, string? DestinationStatus);

}
