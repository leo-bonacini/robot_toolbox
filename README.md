# Robot Toolbox

Robotics engineering tools runs entirely in the browser, no backend required.

## Overview

Robot Toolbox is a comprehensive collection of interactive engineering tools for robotics researchers, engineers, students, and educators. It runs as a pure static web application deployable on GitHub Pages with no server, build step, or installation required.

## Features

### Rotation and Kinematics
- **Rotation Converter** — Convert between Euler angles, quaternions, rotation matrices, axis-angle, and Rodrigues vectors with live synchronization
- **Quaternion Toolbox** — Normalize, multiply, inverse, conjugate, SLERP interpolation with interactive chart
- **Rotation Matrix Tool** — Validate SO(3) matrices: orthogonality check, determinant, eigenvalues, inverse
- **DH Calculator** — Denavit-Hartenberg parameter table with forward kinematics and full transformation matrices

### Motion and Drive Systems
- **Differential Drive** — Bidirectional kinematics: robot velocities ↔ wheel speeds, with animated diagram
- **Ackermann Steering** — Steering geometry: turning radius ↔ wheel angles with visual diagram
- **Mecanum Wheels** — Forward and inverse kinematics for holonomic drive
- **Skid Steer** — Tank-drive kinematics

### Control and Planning
- **PID Tuner** — Interactive Kp/Ki/Kd sliders with live step response simulation and metrics (overshoot, rise time, settling time)
- **Motion Profile** — Trapezoidal and S-curve 1D motion profiles with position/velocity/acceleration/jerk plots
- **Trajectory Generator** — Circle, figure-eight, spiral, Lissajous, Bezier curve trajectories with CSV export

### Math and Utilities
- **Unit Converter** — 13 categories: distance, velocity, angular velocity, force, torque, mass, pressure, temperature, time, power, energy, angle
- **Matrix Calculator** — Add, subtract, multiply, transpose, inverse, determinant, rank, trace, eigenvalues (2×2), LU decomposition
- **Covariance Visualizer** — Confidence ellipses from 2×2 covariance matrices with principal axes
- **Coordinate Frame Converter** — ENU, NED, ECEF, WGS-84 LLH conversions with full geodetic accuracy

### Sensors and Vision
- **IMU Noise Calculator** — Convert datasheet ARW/bias values to ROS `robot_localization` parameters
- **Camera FOV Calculator** — Compute H/V/D-FOV, GSD, coverage area and camera intrinsics matrix K


## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘K` / `Ctrl+K` | Open search |
| `H` | Go to home |
| `⌘,` | Open settings |
| `?` | Show all shortcuts |
| `Esc` | Close modal / blur input |
