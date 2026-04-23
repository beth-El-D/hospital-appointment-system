using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MediSyncAPI.Data;
using MediSyncAPI.Models;

namespace MediSyncAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Requires JWT token for all endpoints
    public class AppointmentsController : ControllerBase
    {
        private readonly MediSyncDbContext _context;

        public AppointmentsController(MediSyncDbContext context)
        {
            _context = context;
        }

        // GET: api/appointments
        [HttpGet]
        public async Task<ActionResult<ApiResponse<PaginatedResponse<AppointmentDto>>>> GetAppointments(
            [FromQuery] string? search,
            [FromQuery] string? doctorName,
            [FromQuery] string? status,
            [FromQuery] string? priority,
            [FromQuery] string? dateFrom,
            [FromQuery] string? dateTo,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 50)
        {
            try
            {
                // Get current user info from JWT token
                var currentUserRole = User.FindFirst("role")?.Value;
                var currentUserFirstName = User.FindFirst("firstName")?.Value;
                var currentUserLastName = User.FindFirst("lastName")?.Value;
                var currentDoctorName = $"Dr. {currentUserFirstName} {currentUserLastName}";

                var query = _context.Appointments.AsQueryable();

                // Role-based filtering: Doctors can only see their own appointments
                if (currentUserRole == "Doctor")
                {
                    query = query.Where(a => a.DoctorName == currentDoctorName);
                }
                // Admin and Receptionist can see all appointments (no additional filtering needed)

                // Apply other filters
                if (!string.IsNullOrEmpty(search))
                {
                    query = query.Where(a => 
                        a.PatientName.Contains(search) || 
                        a.PatientEmail.Contains(search) ||
                        a.DoctorName.Contains(search));
                }

                if (!string.IsNullOrEmpty(doctorName))
                {
                    query = query.Where(a => a.DoctorName.Contains(doctorName));
                }

                if (!string.IsNullOrEmpty(status))
                {
                    query = query.Where(a => a.Status == status);
                }

                if (!string.IsNullOrEmpty(priority))
                {
                    query = query.Where(a => a.Priority == priority);
                }

                if (!string.IsNullOrEmpty(dateFrom) && DateTime.TryParse(dateFrom, out var fromDate))
                {
                    query = query.Where(a => a.AppointmentDate >= fromDate);
                }

                if (!string.IsNullOrEmpty(dateTo) && DateTime.TryParse(dateTo, out var toDate))
                {
                    query = query.Where(a => a.AppointmentDate <= toDate);
                }

                // Get total count for pagination
                var totalCount = await query.CountAsync();

                // Apply pagination and ordering
                var appointments = await query
                    .OrderBy(a => a.AppointmentDate)
                    .ThenBy(a => a.AppointmentTime)
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                // Convert to DTOs
                var appointmentDtos = appointments.Select(a => a.ToDto()).ToList();

                var response = new PaginatedResponse<AppointmentDto>
                {
                    Data = appointmentDtos,
                    TotalCount = totalCount,
                    PageNumber = pageNumber,
                    PageSize = pageSize,
                    TotalPages = (int)Math.Ceiling((double)totalCount / pageSize)
                };

                return Ok(new ApiResponse<PaginatedResponse<AppointmentDto>>
                {
                    Success = true,
                    Data = response,
                    Message = "Appointments retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<PaginatedResponse<AppointmentDto>>
                {
                    Success = false,
                    Message = "An error occurred while retrieving appointments",
                    Errors = new[] { ex.Message }
                });
            }
        }

        // GET: api/appointments/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<AppointmentDto>>> GetAppointment(int id)
        {
            try
            {
                var appointment = await _context.Appointments.FindAsync(id);

                if (appointment == null)
                {
                    return NotFound(new ApiResponse<AppointmentDto>
                    {
                        Success = false,
                        Message = $"Appointment with ID {id} not found"
                    });
                }

                // Role-based access control: Doctors can only access their own appointments
                var currentUserRole = User.FindFirst("role")?.Value;
                if (currentUserRole == "Doctor")
                {
                    var currentUserFirstName = User.FindFirst("firstName")?.Value;
                    var currentUserLastName = User.FindFirst("lastName")?.Value;
                    var currentDoctorName = $"Dr. {currentUserFirstName} {currentUserLastName}";

                    if (appointment.DoctorName != currentDoctorName)
                    {
                        return Forbid(); // 403 Forbidden - user doesn't have access to this appointment
                    }
                }

                return Ok(new ApiResponse<AppointmentDto>
                {
                    Success = true,
                    Data = appointment.ToDto(),
                    Message = "Appointment retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<AppointmentDto>
                {
                    Success = false,
                    Message = "An error occurred while retrieving the appointment",
                    Errors = new[] { ex.Message }
                });
            }
        }

        // POST: api/appointments
        [HttpPost]
        public async Task<ActionResult<ApiResponse<AppointmentDto>>> CreateAppointment(CreateAppointmentRequest request)
        {
            try
            {
                // Validate input data
                if (string.IsNullOrWhiteSpace(request.PatientName))
                {
                    return BadRequest(new ApiResponse<Appointment>
                    {
                        Success = false,
                        Message = "Patient name is required and cannot be empty"
                    });
                }

                if (string.IsNullOrWhiteSpace(request.PatientEmail))
                {
                    return BadRequest(new ApiResponse<Appointment>
                    {
                        Success = false,
                        Message = "Patient email is required and cannot be empty"
                    });
                }

                if (string.IsNullOrWhiteSpace(request.DoctorName))
                {
                    return BadRequest(new ApiResponse<Appointment>
                    {
                        Success = false,
                        Message = "Doctor name is required and cannot be empty"
                    });
                }

                // Validate date format
                if (!DateTime.TryParse(request.AppointmentDate, out var appointmentDate))
                {
                    return BadRequest(new ApiResponse<Appointment>
                    {
                        Success = false,
                        Message = $"Invalid appointment date format: '{request.AppointmentDate}'. Please use a valid date format (e.g., 2026-04-26)"
                    });
                }

                // Validate time format
                if (!TimeSpan.TryParse(request.AppointmentTime, out var appointmentTime))
                {
                    return BadRequest(new ApiResponse<Appointment>
                    {
                        Success = false,
                        Message = $"Invalid appointment time format: '{request.AppointmentTime}'. Please use HH:mm format (e.g., 14:30)"
                    });
                }

                // Validate priority
                var validPriorities = new[] { "Low", "Medium", "High", "Urgent" };
                if (!validPriorities.Contains(request.Priority))
                {
                    return BadRequest(new ApiResponse<Appointment>
                    {
                        Success = false,
                        Message = $"Invalid priority: '{request.Priority}'. Valid options are: {string.Join(", ", validPriorities)}"
                    });
                }

                var appointment = new Appointment
                {
                    PatientName = request.PatientName.Trim(),
                    PatientEmail = request.PatientEmail.Trim(),
                    PatientPhone = request.PatientPhone?.Trim() ?? "",
                    DoctorName = request.DoctorName.Trim(),
                    AppointmentDate = appointmentDate,
                    AppointmentTime = appointmentTime,
                    Priority = request.Priority,
                    Status = "Scheduled", // Default status
                    Notes = request.Notes?.Trim()
                };

                _context.Appointments.Add(appointment);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetAppointment), new { id = appointment.Id }, 
                    new ApiResponse<AppointmentDto>
                    {
                        Success = true,
                        Data = appointment.ToDto(),
                        Message = "Appointment created successfully"
                    });
            }
            catch (Exception ex)
            {
                // Log the full error for debugging
                Console.WriteLine($"❌ Create Appointment Error: {ex.Message}");
                Console.WriteLine($"📍 Stack Trace: {ex.StackTrace}");
                
                return StatusCode(500, new ApiResponse<AppointmentDto>
                {
                    Success = false,
                    Message = "An unexpected error occurred while creating the appointment. Please try again.",
                    Errors = new[] { ex.Message }
                });
            }
        }

        // PUT: api/appointments/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<AppointmentDto>>> UpdateAppointment(int id, UpdateAppointmentRequest request)
        {
            try
            {
                // Validate input data
                if (string.IsNullOrWhiteSpace(request.PatientName))
                {
                    return BadRequest(new ApiResponse<Appointment>
                    {
                        Success = false,
                        Message = "Patient name is required and cannot be empty"
                    });
                }

                if (string.IsNullOrWhiteSpace(request.PatientEmail))
                {
                    return BadRequest(new ApiResponse<Appointment>
                    {
                        Success = false,
                        Message = "Patient email is required and cannot be empty"
                    });
                }

                if (string.IsNullOrWhiteSpace(request.DoctorName))
                {
                    return BadRequest(new ApiResponse<Appointment>
                    {
                        Success = false,
                        Message = "Doctor name is required and cannot be empty"
                    });
                }

                // Validate date format
                if (!DateTime.TryParse(request.AppointmentDate, out var appointmentDate))
                {
                    return BadRequest(new ApiResponse<Appointment>
                    {
                        Success = false,
                        Message = $"Invalid appointment date format: '{request.AppointmentDate}'. Please use a valid date format (e.g., 2026-04-26)"
                    });
                }

                // Validate time format
                if (!TimeSpan.TryParse(request.AppointmentTime, out var appointmentTime))
                {
                    return BadRequest(new ApiResponse<Appointment>
                    {
                        Success = false,
                        Message = $"Invalid appointment time format: '{request.AppointmentTime}'. Please use HH:mm format (e.g., 14:30)"
                    });
                }

                // Validate priority
                var validPriorities = new[] { "Low", "Medium", "High", "Urgent" };
                if (!validPriorities.Contains(request.Priority))
                {
                    return BadRequest(new ApiResponse<Appointment>
                    {
                        Success = false,
                        Message = $"Invalid priority: '{request.Priority}'. Valid options are: {string.Join(", ", validPriorities)}"
                    });
                }

                // Validate status
                var validStatuses = new[] { "Scheduled", "Completed", "Cancelled", "NoShow" };
                if (!validStatuses.Contains(request.Status))
                {
                    return BadRequest(new ApiResponse<Appointment>
                    {
                        Success = false,
                        Message = $"Invalid status: '{request.Status}'. Valid options are: {string.Join(", ", validStatuses)}"
                    });
                }

                // Check if ID is provided and matches
                if (!string.IsNullOrEmpty(request.Id) && id.ToString() != request.Id)
                {
                    return BadRequest(new ApiResponse<Appointment>
                    {
                        Success = false,
                        Message = $"ID mismatch: URL ID ({id}) does not match request body ID ({request.Id})"
                    });
                }

                var appointment = await _context.Appointments.FindAsync(id);
                if (appointment == null)
                {
                    return NotFound(new ApiResponse<AppointmentDto>
                    {
                        Success = false,
                        Message = $"Appointment with ID {id} not found"
                    });
                }

                // Role-based access control: Doctors can only update their own appointments
                var currentUserRole = User.FindFirst("role")?.Value;
                if (currentUserRole == "Doctor")
                {
                    var currentUserFirstName = User.FindFirst("firstName")?.Value;
                    var currentUserLastName = User.FindFirst("lastName")?.Value;
                    var currentDoctorName = $"Dr. {currentUserFirstName} {currentUserLastName}";

                    if (appointment.DoctorName != currentDoctorName)
                    {
                        return Forbid(); // 403 Forbidden - user doesn't have access to this appointment
                    }
                }

                // Update appointment properties
                appointment.PatientName = request.PatientName.Trim();
                appointment.PatientEmail = request.PatientEmail.Trim();
                appointment.PatientPhone = request.PatientPhone?.Trim() ?? "";
                appointment.DoctorName = request.DoctorName.Trim();
                appointment.AppointmentDate = appointmentDate;
                appointment.AppointmentTime = appointmentTime;
                appointment.Priority = request.Priority;
                appointment.Status = request.Status;
                appointment.Notes = request.Notes?.Trim();

                await _context.SaveChangesAsync();

                return Ok(new ApiResponse<Appointment>
                {
                    Success = true,
                    Data = appointment,
                    Message = "Appointment updated successfully"
                });
            }
            catch (DbUpdateConcurrencyException)
            {
                return Conflict(new ApiResponse<Appointment>
                {
                    Success = false,
                    Message = "This appointment was modified by another user. Please refresh and try again."
                });
            }
            catch (Exception ex)
            {
                // Log the full error for debugging
                Console.WriteLine($"❌ Update Appointment Error: {ex.Message}");
                Console.WriteLine($"📍 Stack Trace: {ex.StackTrace}");
                
                return StatusCode(500, new ApiResponse<Appointment>
                {
                    Success = false,
                    Message = "An unexpected error occurred while updating the appointment. Please try again.",
                    Errors = new[] { ex.Message }
                });
            }
        }

        // DELETE: api/appointments/{id}
        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<object>>> DeleteAppointment(int id)
        {
            try
            {
                var appointment = await _context.Appointments.FindAsync(id);
                if (appointment == null)
                {
                    return NotFound(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "Appointment not found"
                    });
                }

                _context.Appointments.Remove(appointment);
                await _context.SaveChangesAsync();

                return Ok(new ApiResponse<object>
                {
                    Success = true,
                    Message = "Appointment deleted successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "An error occurred while deleting the appointment",
                    Errors = new[] { ex.Message }
                });
            }
        }
    }
}