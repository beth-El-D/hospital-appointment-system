using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MediSyncAPI.Data;
using MediSyncAPI.Models;

namespace MediSyncAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TestController : ControllerBase
    {
        private readonly MediSyncDbContext _context;

        public TestController(MediSyncDbContext context)
        {
            _context = context;
        }

        [HttpGet("health")]
        public async Task<IActionResult> Health()
        {
            try
            {
                var userCount = await _context.Users.CountAsync();
                var appointmentCount = await _context.Appointments.CountAsync();
                
                return Ok(new
                {
                    Status = "Healthy",
                    Database = "Connected",
                    Users = userCount,
                    Appointments = appointmentCount,
                    Timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    Status = "Error",
                    Message = ex.Message,
                    StackTrace = ex.StackTrace
                });
            }
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            try
            {
                var users = await _context.Users.ToListAsync();
                return Ok(users);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    Error = ex.Message,
                    StackTrace = ex.StackTrace
                });
            }
        }

        [HttpPost("test-user")]
        public async Task<IActionResult> CreateTestUser()
        {
            try
            {
                var testUser = new User
                {
                    Email = "test@test.com",
                    Password = "hashedpassword",
                    FirstName = "Test",
                    LastName = "User",
                    Role = "Doctor",
                    CreatedAt = DateTime.UtcNow
                };

                _context.Users.Add(testUser);
                await _context.SaveChangesAsync();

                return Ok(new { Message = "Test user created", User = testUser });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    Error = ex.Message,
                    StackTrace = ex.StackTrace
                });
            }
        }
    }
}