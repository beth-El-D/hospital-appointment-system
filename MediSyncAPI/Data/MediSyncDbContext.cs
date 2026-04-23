using Microsoft.EntityFrameworkCore;
using MediSyncAPI.Models;

namespace MediSyncAPI.Data
{
    public class MediSyncDbContext : DbContext
    {
        public MediSyncDbContext(DbContextOptions<MediSyncDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Appointment> Appointments { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Configure User entity
            builder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).ValueGeneratedOnAdd(); // Auto-generate ID
                entity.HasIndex(e => e.Email).IsUnique();
            });

            // Configure Appointment entity
            builder.Entity<Appointment>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).ValueGeneratedOnAdd(); // Auto-generate ID
                entity.HasIndex(e => e.PatientEmail);
                entity.HasIndex(e => e.AppointmentDate);
                entity.HasIndex(e => e.Status);
            });
        }
    }
}