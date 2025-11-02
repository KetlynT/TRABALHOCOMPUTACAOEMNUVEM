using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjectManagement.Api.Data;
using ProjectManagement.Api.Domain;

namespace ProjectManagement.Api.Controllers;
[ApiController]
[Route("api/[controller]")]
public class ProjectsController : ControllerBase
{
    private readonly AppDbContext _db;
    public ProjectsController(AppDbContext db) { _db = db; }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var list = await _db.Projects.Include(p => p.Boards).ToListAsync();
        return Ok(list);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(Guid id)
    {
        var project = await _db.Projects.Include(p => p.Boards).ThenInclude(b => b.Tasks).FirstOrDefaultAsync(p => p.Id == id);
        if (project == null) return NotFound();
        return Ok(project);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Project proj)
    {
        proj.Id = Guid.NewGuid();
        _db.Projects.Add(proj);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = proj.Id }, proj);
    }
}
