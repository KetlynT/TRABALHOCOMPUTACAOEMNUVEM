using Microsoft.AspNetCore.Mvc;
using ProjectManagement.Api.Data;
using ProjectManagement.Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace ProjectManagement.Api.Controllers;
[ApiController]
[Route("api/[controller]")]
public class FilesController : ControllerBase
{
    private readonly IWebHostEnvironment _env;
    private readonly AppDbContext _db;

    public FilesController(IWebHostEnvironment env, AppDbContext db)
    {
        _env = env;
        _db = db;
    }

    [HttpPost("upload/{taskId}")]
    public async Task<IActionResult> Upload(Guid taskId, IFormFile file)
    {
        if (file == null || file.Length == 0) return BadRequest("file required");

        var uploads = Path.Combine(_env.ContentRootPath, "uploads");
        if (!Directory.Exists(uploads)) Directory.CreateDirectory(uploads);

        var fileName = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";
        var path = Path.Combine(uploads, fileName);
        using var stream = System.IO.File.Create(path);
        await file.CopyToAsync(stream);

        var attachment = new TaskAttachment
        {
            Id = Guid.NewGuid(),
            TaskItemId = taskId,
            FileName = file.FileName,
            FilePath = $"/uploads/{fileName}",
            UploadedBy = User?.Identity?.Name ?? "anonymous"
        };
        _db.TaskAttachments.Add(attachment);
        await _db.SaveChangesAsync();

        return Ok(new { attachment.Id, attachment.FileName, attachment.FilePath });
    }

    [HttpGet("task/{taskId}")]
    public async Task<IActionResult> ListByTask(Guid taskId)
    {
        var list = await _db.TaskAttachments
            .Where(a => a.TaskItemId == taskId)
            .Select(a => new { a.Id, a.FileName, a.FilePath, a.CreatedAt, a.UploadedBy })
            .ToListAsync();
        return Ok(list);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var att = await _db.TaskAttachments.FindAsync(id);
        if (att == null) return NotFound();

        // remove arquivo físico (se existir)
        var localPath = Path.Combine(_env.ContentRootPath, att.FilePath.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));
        if (System.IO.File.Exists(localPath))
        {
            try { System.IO.File.Delete(localPath); } catch { /* swallow */ }
        }

        _db.TaskAttachments.Remove(att);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // opcional: servir arquivos estáticos do folder /uploads via endpoint
    [HttpGet("raw/{filename}")]
    public IActionResult Raw(string filename)
    {
        var uploads = Path.Combine(_env.ContentRootPath, "uploads");
        var path = Path.Combine(uploads, filename);
        if (!System.IO.File.Exists(path)) return NotFound();
        var bytes = System.IO.File.ReadAllBytes(path);
        var contentType = "application/octet-stream";
        return File(bytes, contentType, Path.GetFileName(path));
    }
}
