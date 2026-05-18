import fs from 'fs';

const file = fs.readFileSync('src/i18n.ts', 'utf8');
let newFile = file;

const idRepl = `"profile.title": "Edit Profil",
      "profile.default_name": "Pengguna",
      "profile.name_label": "Nama Panggilan",
      "profile.sports_label": "OLAHRAGA FAVORIT",
      "profile.add_sport": "Tambah olahraga lain (tekan Enter)...",
      "profile.btn_save": "Simpan Perubahan",
      "profile.saved": "Profil diperbarui!",
      "profile.error": "Gagal memperbarui profil."`;

const enRepl = `"profile.title": "Edit Profile",
      "profile.default_name": "User",
      "profile.name_label": "Nickname",
      "profile.sports_label": "FAVORITE SPORTS",
      "profile.add_sport": "Add another sport (press Enter)...",
      "profile.btn_save": "Save Changes",
      "profile.saved": "Profile updated!",
      "profile.error": "Failed to update profile."`;

const esRepl = `"profile.title": "Editar Perfil",
      "profile.default_name": "Usuario",
      "profile.name_label": "Apodo",
      "profile.sports_label": "DEPORTES FAVORITOS",
      "profile.add_sport": "Añade otro deporte (pulsa Intro)...",
      "profile.btn_save": "Guardar Cambios",
      "profile.saved": "¡Perfil actualizado!",
      "profile.error": "Error al actualizar el perfil."`;

const zhRepl = `"profile.title": "编辑资料",
      "profile.default_name": "用户",
      "profile.name_label": "昵称",
      "profile.sports_label": "喜欢的运动",
      "profile.add_sport": "添加其他运动（按回车键）...",
      "profile.btn_save": "保存更改",
      "profile.saved": "资料已更新！",
      "profile.error": "更新资料失败。"`;

const sections = newFile.split('"calc.title_start":');

// We have 4 languages: id, en, es, zh. So length should be 5
newFile = sections[0] + idRepl + ',\n\n      "calc.title_start":' +
          sections[1] + enRepl + ',\n\n      "calc.title_start":' +
          sections[2] + esRepl + ',\n\n      "calc.title_start":' +
          sections[3] + zhRepl + ',\n\n      "calc.title_start":' + 
          sections[4];

fs.writeFileSync('src/i18n.ts', newFile, 'utf8');
