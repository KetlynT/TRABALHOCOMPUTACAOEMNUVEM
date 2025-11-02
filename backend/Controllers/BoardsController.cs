using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjectManagement.Api.Data;
using ProjectManagement.Api.Domain;

namespace ProjectManagement.Api.Controllers;
[ApiController]
[Route("api/[controller]")]
public class BoardsController : ControllerBase
{
    private readonly AppDbContext _db;
    public BoardsController(AppDbContext db) { _db = db; }

    [HttpPost]
    public async Task<IActionResult> Create(Board board)
    {
        board.Id = Guid.NewGuid();
        _db.Boards.Add(board);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = board.Id }, board);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(Guid id)
    {
        var b = await _db.Boards.Include(x => x.Tasks).FirstOrDefaultAsync(x => x.Id == id);
        if (b == null) return NotFound();
        return Ok(b);
    }
}
