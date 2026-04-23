-- =============================================
--  Database Creation Script
-- =============================================
-- This script creates only the essential database structure
-- without sample data for production environments

-- Create the database
CREATE DATABASE MediSyncDb;
GO

-- Use the database
USE MediSyncDb;
GO

-- Create Users Table
CREATE TABLE [dbo].[Users] (
    [Id] int IDENTITY(1,1) NOT NULL,
    [Email] nvarchar(450) NOT NULL,
    [Password] nvarchar(max) NOT NULL,
    [FirstName] nvarchar(50) NOT NULL,
    [LastName] nvarchar(50) NOT NULL,
    [Role] nvarchar(max) NOT NULL,
    [CreatedAt] datetime2(7) NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT [PK_Users] PRIMARY KEY ([Id])
);

-- Create unique index on Email
CREATE UNIQUE NONCLUSTERED INDEX [IX_Users_Email] ON [dbo].[Users] ([Email]);

-- Create Appointments Table
CREATE TABLE [dbo].[Appointments] (
    [Id] int IDENTITY(1,1) NOT NULL,
    [PatientName] nvarchar(100) NOT NULL,
    [PatientEmail] nvarchar(450) NOT NULL,
    [PatientPhone] nvarchar(max) NOT NULL,
    [DoctorName] nvarchar(100) NOT NULL,
    [AppointmentDate] datetime2(7) NOT NULL,
    [AppointmentTime] time(7) NOT NULL,
    [Priority] nvarchar(max) NOT NULL,
    [Status] nvarchar(max) NOT NULL,
    [Notes] nvarchar(1000) NULL,
    [CreatedAt] datetime2(7) NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT [PK_Appointments] PRIMARY KEY ([Id])
);

-- Create indexes for better performance
CREATE NONCLUSTERED INDEX [IX_Appointments_PatientEmail] ON [dbo].[Appointments] ([PatientEmail]);
CREATE NONCLUSTERED INDEX [IX_Appointments_AppointmentDate] ON [dbo].[Appointments] ([AppointmentDate]);
CREATE NONCLUSTERED INDEX [IX_Appointments_Status] ON [dbo].[Appointments] ([Status]);

PRINT 'Database structure created successfully!';
PRINT 'You can now run the application and register your first admin user.';