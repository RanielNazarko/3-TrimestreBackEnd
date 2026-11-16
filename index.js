const express = require('express');
const db = require('./db');

const app = express();
app.use(express.json());

app.get('/aula', async (req, res) => {
  try {
    const [aulas] = await db.query('SELECT * FROM aula');
    return res.status(200).json(aulas);
  } catch (error) {
    return res.status(500).json({ erro: 'Erro interno ao listar aulas.', detalhes: error.message });
  }
});

app.post('/aula', async (req, res) => {
  const { disciplina, professor } = req.body;
  if (!disciplina || !professor) {
    return res.status(400).json({ erro: 'Os campos disciplina e professor são obrigatórios.' });
  }

  try {
    const [resultado] = await db.query(
      'INSERT INTO aula (disciplina, professor) VALUES (?, ?)',
      [disciplina, professor]
    );
    return res.status(201).json({
      mensagem: 'Aula cadastrada com sucesso!',
      id: resultado.insertId
    });
  } catch (error) {
    return res.status(500).json({ erro: 'Erro interno ao cadastrar aula.', detalhes: error.message });
  }
});

app.delete('/aula/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [resultado] = await db.query('DELETE FROM aula WHERE id = ?', [id]);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ erro: 'Aula não encontrada.' });
    }

    return res.status(200).json({ mensagem: 'Aula removida com sucesso!' });
  } catch (error) {
    if (error.errno === 1451 || error.code === '23503') {
      return res.status(400).json({
        erro: 'Erro de chave estrangeira: Não é possível excluir esta aula pois existem horários vinculados a ela.'
      });
    }
    return res.status(500).json({ erro: 'Erro interno ao deletar aula.', detalhes: error.message });
  }
});

app.post('/horario', async (req, res) => {
  const { dia_semana, hora_inicio, hora_fim, aula_id } = req.body;

  if (!dia_semana || !hora_inicio || !hora_fim || !aula_id) {
    return res.status(400).json({
      erro: 'Todos os campos (dia_semana, hora_inicio, hora_fim, aula_id) são obrigatórios.'
    });
  }

  try {
    const sql = 'INSERT INTO horario (dia_semana, hora_inicio, hora_fim, aula_id) VALUES (?, ?, ?, ?)';
    const [resultado] = await db.query(sql, [dia_semana, hora_inicio, hora_fim, aula_id]);

    return res.status(201).json({
      mensagem: 'Horário cadastrado com sucesso!',
      id: resultado.insertId
    });
  } catch (error) {
    // Validação da regra de chave estrangeira (aula_id inexistente na tabela aula)
    if (error.errno === 1452 || error.code === '23503') {
      return res.status(400).json({
        erro: 'Erro de chave estrangeira: A aula informada (aula_id) não existe na tabela "aula".'
      });
    }

    return res.status(500).json({ erro: 'Erro interno ao cadastrar horário.', detalhes: error.message });
  }
});

app.get('/horario/:dia', async (req, res) => {
  const { dia } = req.params;

  try {
    const sql = `
      SELECT h.id, h.dia_semana, h.hora_inicio, h.hora_fim, h.aula_id, a.disciplina, a.professor
      FROM horario h
      INNER JOIN aula a ON h.aula_id = a.id
      WHERE h.dia_semana = ?
    `;
    const [horarios] = await db.query(sql, [dia]);

    if (horarios.length === 0) {
      return res.status(404).json({ mensagem: `Nenhum horário encontrado para ${dia}.` });
    }

    return res.status(200).json(horarios);
  } catch (error) {
    return res.status(500).json({ erro: 'Erro interno ao buscar horários.', detalhes: error.message });
  }
});

app.delete('/horario/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [resultado] = await db.query('DELETE FROM horario WHERE id = ?', [id]);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ erro: 'Horário não encontrado.' });
    }

    return res.status(200).json({ mensagem: 'Horário removido com sucesso!' });
  } catch (error) {
    return res.status(500).json({ erro: 'Erro interno ao deletar horário.', detalhes: error.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
