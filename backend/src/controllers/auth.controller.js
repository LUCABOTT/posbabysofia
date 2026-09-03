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
        nombre: user.nombre,
        email: user.email,
        rol_id: user.rol_id,
        rol: user.rol.nombre
      },
      jwtSecret,
      {
        expiresIn: jwtExpiresIn
      }
    );

    res.cookie('posbabysofia_token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 8 * 60 * 60 * 1000
    });

    return res.json({
      message: 'Inicio de sesión exitoso',
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

const logout = (req, res) => {
  res.clearCookie('posbabysofia_token', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  });

  return res.json({ message: 'Sesión cerrada correctamente' });
};

const registrarUsuario = async (req, res) => {
  try {
    const { nombre, email, password, rol_id } = req.body;

    if (!nombre?.trim() || !email?.trim() || !password || !rol_id) {
      return res.status(400).json({
        message: 'nombre, email, password y rol_id son obligatorios'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    const rol = await Role.findOne({
      where: { id: rol_id, activo: true }
    });

    if (!rol) {
      return res.status(400).json({
        message: 'El rol no existe o está inactivo'
      });
    }

    const emailNormalizado = email.trim().toLowerCase();
    const usuarioExistente = await User.findOne({
      where: { email: emailNormalizado }
    });

    if (usuarioExistente) {
      return res.status(409).json({
        message: 'Ya existe un usuario con ese correo'
      });
    }

    const usuario = await User.create({
      nombre: nombre.trim(),
      email: emailNormalizado,
      password: await bcrypt.hash(password, 10),
      rol_id: rol.id,
      activo: true
    });

    return res.status(201).json({
      message: 'Usuario registrado correctamente',
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: rol.nombre,
        activo: usuario.activo
      }
    });
  } catch (error) {
    console.error('Error al registrar usuario:', error);

    return res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
};


const listarUsuarios = async (req, res) => {
  try {

    const usuarios = await User.findAll({
      attributes: [
        'id',
        'nombre',
        'email',
        'rol_id',
        'activo',
        'created_at'
      ],
      include: [
        {
          model: Role,
          as: 'rol',
          attributes: [
            'id',
            'nombre',
            'descripcion'
          ]
        }
      ],
      order: [
        ['created_at', 'DESC']
      ]
    })

    return res.json({
      usuarios
    })

  } catch (error) {

    console.error(
      'Error al listar usuarios:',
      error
    )

    return res.status(500).json({
      message: 'Error interno del servidor'
    })
  }
}


const editarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, rol_id } = req.body;

    if (!nombre?.trim() || !email?.trim() || !rol_id) {
      return res.status(400).json({
        message: 'nombre, email y rol_id son obligatorios'
      });
    }

    const usuario = await User.findByPk(id);

    if (!usuario) {
      return res.status(404).json({
        message: 'Usuario no encontrado'
      });
    }

    const emailNormalizado = email.trim().toLowerCase();

    const emailExistente = await User.findOne({
      where: {
        email: emailNormalizado
      }
    });

    if (emailExistente && Number(emailExistente.id) !== Number(id)) {
      return res.status(409).json({
        message: 'Ya existe otro usuario con ese correo'
      });
    }

    const rol = await Role.findOne({
      where: {
        id: rol_id,
        activo: true
      }
    });

    if (!rol) {
      return res.status(400).json({
        message: 'El rol no existe o está inactivo'
      });
    }

    usuario.nombre = nombre.trim();
    usuario.email = emailNormalizado;
    usuario.rol_id = rol.id;

    await usuario.save();

    return res.json({
      message: 'Usuario actualizado correctamente',
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: rol.nombre,
        activo: usuario.activo
      }
    });

  } catch (error) {
    console.error('Error al editar usuario:', error);

    return res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
};


const cambiarEstadoUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { activo } = req.body;

    if (typeof activo !== 'boolean') {
      return res.status(400).json({
        message: 'El campo activo debe ser verdadero o falso'
      });
    }

    const usuario = await User.findByPk(id);

    if (!usuario) {
      return res.status(404).json({
        message: 'Usuario no encontrado'
      });
    }

    // Evitar que el SUPER_ADMIN se desactive a sí mismo
    if (
      Number(usuario.id) === Number(req.user.id) &&
      activo === false
    ) {
      return res.status(400).json({
        message: 'No puedes desactivar tu propio usuario'
      });
    }

    usuario.activo = activo;

    await usuario.save();

    return res.json({
      message: activo
        ? 'Usuario activado correctamente'
        : 'Usuario desactivado correctamente',
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol_id: usuario.rol_id,
        activo: usuario.activo
      }
    });

  } catch (error) {
    console.error('Error al cambiar estado del usuario:', error);

    return res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
};


module.exports = {
  login,
  logout,
  registrarUsuario,
  listarUsuarios,
  editarUsuario,
  cambiarEstadoUsuario
};