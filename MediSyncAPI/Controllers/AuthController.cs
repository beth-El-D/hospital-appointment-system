using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using MediSyncAPI.Models;
using MediSyncAPI.Data;
using System.Security.Cryptography;
using Microsoft.Data.SqlClient;
using Microsoft.AspNetCore.Cors;

namespace MediSyncAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableCors("AllowReactApp")]
    public class AuthController : ControllerBase
    {
        private readonly MediSyncDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(MediSyncDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                // Validate input
                if (string.IsNullOrWhiteSpace(request.Email))
                {
                    return BadRequest(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "Email address is required and cannot be empty"
                    });
                }

                if (string.IsNullOrWhiteSpace(request.Password))
                {
                    return BadRequest(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "Password is required and cannot be empty"
                    });
                }

                // Validate email format
                if (!IsValidEmail(request.Email))
                {
                    return BadRequest(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "Please enter a valid email address"
                    });
                }

                // Try to find user with raw SQL to avoid type casting issues
                var userQuery = @"
                    SELECT Id, Email, Password, FirstName, LastName, Role, CreatedAt 
                    FROM Users 
                    WHERE Email = @Email";

                using var connection = new Microsoft.Data.SqlClient.SqlConnection(_context.Database.GetConnectionString());
                await connection.OpenAsync();
                
                using var command = new Microsoft.Data.SqlClient.SqlCommand(userQuery, connection);
                command.Parameters.AddWithValue("@Email", request.Email);
                
                using var reader = await command.ExecuteReaderAsync();
                
                if (await reader.ReadAsync())
                {
                    var user = new User
                    {
                        Id = Convert.ToInt32(reader["Id"] ?? 0),
                        Email = reader["Email"]?.ToString() ?? "",
                        Password = reader["Password"]?.ToString() ?? "",
                        FirstName = reader["FirstName"]?.ToString() ?? "",
                        LastName = reader["LastName"]?.ToString() ?? "",
                        Role = ConvertRoleToString(reader["Role"]),
                        CreatedAt = Convert.ToDateTime(reader["CreatedAt"])
                    };

                    if (VerifyPassword(request.Password, user.Password))
                    {
                        var token = GenerateJwtToken(user);
                        return Ok(new ApiResponse<AuthResponse>
                        {
                            Success = true,
                            Data = new AuthResponse
                            {
                                Token = token,
                                RefreshToken = Guid.NewGuid().ToString(),
                                User = new UserDto
                                {
                                    Id = user.Id.ToString(),
                                    Email = user.Email,
                                    FirstName = user.FirstName,
                                    LastName = user.LastName,
                                    Role = user.Role,
                                    CreatedAt = user.CreatedAt.ToString("yyyy-MM-ddTHH:mm:ssZ")
                                }
                            },
                            Message = "Login successful"
                        });
                    }
                }

                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Invalid email or password. Please check your credentials and try again."
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Login Error: {ex.Message}");
                Console.WriteLine($"Stack Trace: {ex.StackTrace}");
                
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "An error occurred during login",
                    Errors = new[] { ex.Message }
                });
            }
        }

        private string ConvertRoleToString(object roleValue)
        {
            if (roleValue == null) return "Doctor";
            
            // If it's already a string, return it
            if (roleValue is string stringRole)
                return stringRole;
            
            // If it's an integer, convert it
            if (roleValue is int intRole)
            {
                return intRole switch
                {
                    1 => "Admin",
                    2 => "Doctor",
                    3 => "Receptionist",
                    _ => "Doctor"
                };
            }
            
            return "Doctor";
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            try
            {
                // Validate input
                if (string.IsNullOrWhiteSpace(request.Email))
                {
                    return BadRequest(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "Email address is required and cannot be empty"
                    });
                }

                if (string.IsNullOrWhiteSpace(request.Password))
                {
                    return BadRequest(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "Password is required and cannot be empty"
                    });
                }

                if (string.IsNullOrWhiteSpace(request.FirstName))
                {
                    return BadRequest(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "First name is required and cannot be empty"
                    });
                }

                if (string.IsNullOrWhiteSpace(request.LastName))
                {
                    return BadRequest(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "Last name is required and cannot be empty"
                    });
                }

                // Validate email format
                if (!IsValidEmail(request.Email))
                {
                    return BadRequest(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "Please enter a valid email address"
                    });
                }

                // Validate password strength
                if (request.Password.Length < 6)
                {
                    return BadRequest(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "Password must be at least 6 characters long"
                    });
                }

                // Validate role
                var validRoles = new[] { "Admin", "Doctor", "Receptionist" };
                if (!validRoles.Contains(request.Role))
                {
                    return BadRequest(new ApiResponse<object>
                    {
                        Success = false,
                        Message = $"Invalid role: '{request.Role}'. Valid options are: {string.Join(", ", validRoles)}"
                    });
                }

                // Check if user already exists using raw SQL
                var checkUserQuery = "SELECT COUNT(*) FROM Users WHERE Email = @Email";
                using var connection = new Microsoft.Data.SqlClient.SqlConnection(_context.Database.GetConnectionString());
                await connection.OpenAsync();
                
                using var checkCommand = new Microsoft.Data.SqlClient.SqlCommand(checkUserQuery, connection);
                checkCommand.Parameters.AddWithValue("@Email", request.Email);
                
                var userExists = (int)await checkCommand.ExecuteScalarAsync() > 0;
                
                if (userExists)
                {
                    return BadRequest(new ApiResponse<object>
                    {
                        Success = false,
                        Message = $"An account with email '{request.Email}' already exists. Please use a different email or try logging in."
                    });
                }

                // Insert new user with auto-generated ID
                var insertUserQuery = @"
                    INSERT INTO Users (Email, Password, FirstName, LastName, Role, CreatedAt)
                    OUTPUT INSERTED.Id
                    VALUES (@Email, @Password, @FirstName, @LastName, @Role, @CreatedAt)";

                var hashedPassword = HashPassword(request.Password);
                var roleValue = ConvertStringRoleToDbValue(request.Role);
                
                using var insertCommand = new Microsoft.Data.SqlClient.SqlCommand(insertUserQuery, connection);
                insertCommand.Parameters.AddWithValue("@Email", request.Email);
                insertCommand.Parameters.AddWithValue("@Password", hashedPassword);
                insertCommand.Parameters.AddWithValue("@FirstName", request.FirstName);
                insertCommand.Parameters.AddWithValue("@LastName", request.LastName);
                insertCommand.Parameters.AddWithValue("@Role", roleValue);
                insertCommand.Parameters.AddWithValue("@CreatedAt", DateTime.UtcNow);

                var newUserId = await insertCommand.ExecuteScalarAsync();
                Console.WriteLine($"✅ User created with ID: {newUserId}");

                return Ok(new ApiResponse<object>
                {
                    Success = true,
                    Message = "User registered successfully"
                });
            }
            catch (Exception ex)
            {
                // Log the actual error for debugging
                Console.WriteLine($"Registration Error: {ex.Message}");
                Console.WriteLine($"Stack Trace: {ex.StackTrace}");
                
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "An error occurred during registration",
                    Errors = new[] { ex.Message }
                });
            }
        }

        private object ConvertStringRoleToDbValue(string role)
        {
            // First try as string (in case your DB stores strings)
            // If that fails, the error will tell us to use integers
            return role;
        }

        [HttpGet("debug-users")]
        public async Task<IActionResult> DebugUsers()
        {
            try
            {
                var usersQuery = "SELECT Id, Email, FirstName, LastName, Role, CreatedAt FROM Users";
                using var connection = new Microsoft.Data.SqlClient.SqlConnection(_context.Database.GetConnectionString());
                await connection.OpenAsync();
                
                using var command = new Microsoft.Data.SqlClient.SqlCommand(usersQuery, connection);
                using var reader = await command.ExecuteReaderAsync();
                
                var users = new List<object>();
                while (await reader.ReadAsync())
                {
                    users.Add(new
                    {
                        Id = reader["Id"].ToString(),
                        Email = reader["Email"].ToString(),
                        FirstName = reader["FirstName"].ToString(),
                        LastName = reader["LastName"].ToString(),
                        Role = ConvertRoleToString(reader["Role"]),
                        CreatedAt = reader["CreatedAt"].ToString()
                    });
                }
                
                return Ok(new { Users = users, Count = users.Count });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Error = ex.Message });
            }
        }

        [HttpPost("test-login")]
        public async Task<IActionResult> TestLogin([FromBody] LoginRequest request)
        {
            try
            {
                Console.WriteLine($"🔍 Testing login for email: {request.Email}");
                
                var userQuery = "SELECT Id, Email, Password, FirstName, LastName, Role, CreatedAt FROM Users WHERE Email = @Email";
                using var connection = new Microsoft.Data.SqlClient.SqlConnection(_context.Database.GetConnectionString());
                await connection.OpenAsync();
                
                using var command = new Microsoft.Data.SqlClient.SqlCommand(userQuery, connection);
                command.Parameters.AddWithValue("@Email", request.Email);
                
                using var reader = await command.ExecuteReaderAsync();
                
                if (await reader.ReadAsync())
                {
                    var storedPassword = reader["Password"].ToString();
                    var hashedInputPassword = HashPassword(request.Password);
                    
                    Console.WriteLine($"📧 User found: {reader["Email"]}");
                    Console.WriteLine($"🔐 Stored password hash: {storedPassword?.Substring(0, Math.Min(10, storedPassword?.Length ?? 0))}...");
                    Console.WriteLine($"🔐 Input password hash: {hashedInputPassword.Substring(0, 10)}...");
                    Console.WriteLine($"✅ Passwords match: {storedPassword == hashedInputPassword}");
                    
                    return Ok(new
                    {
                        UserFound = true,
                        Email = reader["Email"].ToString(),
                        StoredPasswordPreview = storedPassword?.Substring(0, Math.Min(10, storedPassword?.Length ?? 0)) + "...",
                        InputPasswordPreview = hashedInputPassword.Substring(0, 10) + "...",
                        PasswordsMatch = storedPassword == hashedInputPassword
                    });
                }
                else
                {
                    Console.WriteLine($"❌ No user found with email: {request.Email}");
                    return Ok(new { UserFound = false, Email = request.Email });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Test login error: {ex.Message}");
                return StatusCode(500, new { Error = ex.Message });
            }
        }

        private string GenerateJwtToken(User user)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim("firstName", user.FirstName),
                new Claim("lastName", user.LastName),
                new Claim("role", user.Role),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddDays(1),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private string HashPassword(string password)
        {
            // Simple password hashing - in production, use BCrypt or similar
            using (var sha256 = SHA256.Create())
            {
                var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password + "MediSyncSalt"));
                return Convert.ToBase64String(hashedBytes);
            }
        }

        private bool VerifyPassword(string password, string hashedPassword)
        {
            var hashOfInput = HashPassword(password);
            return hashOfInput == hashedPassword;
        }

        private bool IsValidEmail(string email)
        {
            try
            {
                var addr = new System.Net.Mail.MailAddress(email);
                return addr.Address == email;
            }
            catch
            {
                return false;
            }
        }

        [HttpPost("setup-default-passwords")]
        public async Task<IActionResult> SetupDefaultPasswords()
        {
            try
            {
                var updates = new[]
                {
                    new { Email = "admin@medisync.com", Password = "admin123" },
                    new { Email = "doctor@medisync.com", Password = "doctor123" },
                    new { Email = "receptionist@medisync.com", Password = "receptionist123" }
                };

                using var connection = new Microsoft.Data.SqlClient.SqlConnection(_context.Database.GetConnectionString());
                await connection.OpenAsync();

                var results = new List<object>();

                foreach (var update in updates)
                {
                    var hashedPassword = HashPassword(update.Password);
                    var updateQuery = "UPDATE Users SET Password = @Password WHERE Email = @Email";
                    
                    using var command = new Microsoft.Data.SqlClient.SqlCommand(updateQuery, connection);
                    command.Parameters.AddWithValue("@Password", hashedPassword);
                    command.Parameters.AddWithValue("@Email", update.Email);
                    
                    var rowsAffected = await command.ExecuteNonQueryAsync();
                    results.Add(new { 
                        Email = update.Email, 
                        Password = update.Password,
                        Updated = rowsAffected > 0 
                    });
                    
                    Console.WriteLine($"🔐 Updated password for {update.Email}: {rowsAffected > 0}");
                }

                return Ok(new
                {
                    Success = true,
                    Message = "Default passwords set successfully",
                    Results = results,
                    Instructions = "You can now login with these credentials in your React app"
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Password setup error: {ex.Message}");
                return StatusCode(500, new { Error = ex.Message, StackTrace = ex.StackTrace });
            }
        }

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Logged out successfully"
            });
        }

        [HttpGet("doctors")]
        public async Task<IActionResult> GetDoctors()
        {
            try
            {
                var doctorsQuery = "SELECT Id, FirstName, LastName, Email FROM Users WHERE Role = @Role";
                using var connection = new Microsoft.Data.SqlClient.SqlConnection(_context.Database.GetConnectionString());
                await connection.OpenAsync();
                
                using var command = new Microsoft.Data.SqlClient.SqlCommand(doctorsQuery, connection);
                command.Parameters.AddWithValue("@Role", "Doctor");
                
                using var reader = await command.ExecuteReaderAsync();
                
                var doctors = new List<object>();
                while (await reader.ReadAsync())
                {
                    doctors.Add(new
                    {
                        Id = reader["Id"].ToString(),
                        Name = $"Dr. {reader["FirstName"]} {reader["LastName"]}",
                        Email = reader["Email"].ToString()
                    });
                }
                
                return Ok(new ApiResponse<object>
                {
                    Success = true,
                    Data = doctors,
                    Message = "Doctors retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Get Doctors Error: {ex.Message}");
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "An error occurred while retrieving doctors",
                    Errors = new[] { ex.Message }
                });
            }
        }
    }
}