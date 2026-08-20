'use strict';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { User, Role } = require('../models');
const { jwtSecret, jwtExpiresIn } = require('../config/auth');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'El correo y la contraseña son obligatorios'
      });
    }

    const user = await User.findOne({
      where: {
        email
      },
      include: [
        {
          model: Role,
          as: 'rol',
          attributes: ['id', 'nombre', 'descripcion']
        }
      ]
    });

    if (!user) {
      return res.status(401).json({
        message: 'Credenciales incorrectas'
      });
    }

    if (!user.activo) {
      return res.status(403).json({
        message: 'El usuario está inactivo'
      });
    }

    const passwordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordValid) {
      return res.status(401).json({
        message: 'Credenciales incorrectas'
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        rol_id: user.rol_id,
        rol: user.rol.nombre
      },
      jwtSecret,
      {
        expiresIn: jwtExpiresIn
      }
    );

    return res.json({
      message: 'Inicio de sesión exitoso',
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol.nombre
      }
    });

  } catch (error) {
    console.error('Error en login:', error);

    return res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  login
};