namespace MediSyncAPI.Models
{
    // Authentication DTOs
    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class RegisterRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
    }

    public class AuthResponse
    {
        public UserDto User { get; set; } = new();
        public string Token { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
    }

    public class UserDto
    {
        public string Id { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string CreatedAt { get; set; } = string.Empty;
    }

    // Appointment DTOs
    public class AppointmentDto
    {
        public string Id { get; set; } = string.Empty;
        public string PatientName { get; set; } = string.Empty;
        public string PatientEmail { get; set; } = string.Empty;
        public string PatientPhone { get; set; } = string.Empty;
        public string DoctorName { get; set; } = string.Empty;
        public string AppointmentDate { get; set; } = string.Empty;
        public string AppointmentTime { get; set; } = string.Empty;
        public string Priority { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public string CreatedAt { get; set; } = string.Empty;
    }

    public class CreateAppointmentRequest
    {
        public string PatientName { get; set; } = string.Empty;
        public string PatientEmail { get; set; } = string.Empty;
        public string PatientPhone { get; set; } = string.Empty;
        public string DoctorName { get; set; } = string.Empty;
        public string AppointmentDate { get; set; } = string.Empty;
        public string AppointmentTime { get; set; } = string.Empty;
        public string Priority { get; set; } = string.Empty;
        public string? Notes { get; set; }
    }

    public class UpdateAppointmentRequest : CreateAppointmentRequest
    {
        public string Id { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
    }

    // Generic API Response
    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public T? Data { get; set; }
        public string Message { get; set; } = string.Empty;
        public string[]? Errors { get; set; }
    }

    // Paginated Response
    public class PaginatedResponse<T>
    {
        public List<T> Data { get; set; } = new();
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }

    // Helper extension methods
    public static class AppointmentExtensions
    {
        public static AppointmentDto ToDto(this Appointment appointment)
        {
            return new AppointmentDto
            {
                Id = appointment.Id.ToString(),
                PatientName = appointment.PatientName,
                PatientEmail = appointment.PatientEmail,
                PatientPhone = appointment.PatientPhone,
                DoctorName = appointment.DoctorName,
                AppointmentDate = appointment.AppointmentDate.ToString("yyyy-MM-dd"),
                AppointmentTime = appointment.AppointmentTime.ToString(@"hh\:mm"),
                Priority = appointment.Priority,
                Status = appointment.Status,
                Notes = appointment.Notes,
                CreatedAt = appointment.CreatedAt.ToString("yyyy-MM-ddTHH:mm:ssZ")
            };
        }
    }
}