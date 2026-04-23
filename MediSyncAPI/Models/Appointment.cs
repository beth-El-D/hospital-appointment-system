using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MediSyncAPI.Models
{
    [Table("Appointments")]
    public class Appointment
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("Id")]
        public int Id { get; set; }
        
        [Required]
        [MaxLength(100)]
        [Column("PatientName")]
        public string PatientName { get; set; } = string.Empty;
        
        [Required]
        [EmailAddress]
        [Column("PatientEmail")]
        public string PatientEmail { get; set; } = string.Empty;
        
        [Required]
        [Column("PatientPhone")]
        public string PatientPhone { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(100)]
        [Column("DoctorName")]
        public string DoctorName { get; set; } = string.Empty;
        
        [Column("AppointmentDate")]
        public DateTime AppointmentDate { get; set; }
        
        [Column("AppointmentTime")]
        public TimeSpan AppointmentTime { get; set; }
        
        [Column("Priority")]
        public string Priority { get; set; } = string.Empty; // Low, Medium, High, Urgent
        
        [Column("Status")]
        public string Status { get; set; } = string.Empty;   // Scheduled, Completed, Cancelled, NoShow
        
        [MaxLength(1000)]
        [Column("Notes")]
        public string? Notes { get; set; }
        
        [Column("CreatedAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}