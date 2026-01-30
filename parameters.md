Verificar e Definir os nomes das colunas para ser compátiveis com a API do ERP que retorna as medições do contratos.

Parametros para retornar as medições.
Rota da API interna: http://192.168.69.213:8080/api/cnp/v1/medicoes
{
  "tt-param": [
    {
      "nr-contrato": 369, <--- (numero do contrato)
      "cod-estabel": "01", <--- estabelecimento
      "num-seq-item": 1 <--- sequencia do contrato
    }
  ]
}


"cod-estabel": "01", << PROMA CONTAGEM
"cod-estabel": "02", << PROMA JUATUBA

Resultado do get no contrato 369 no estabelecimento 01 e sequencia 1
Sistema deve fazer o GET, verificar se os dados batem com o do nosso backend.
Armazenar os dados das medições no primeiro GET, salvar os dados no nosso banco, e a segunda consulta deve ser no nosso banco. Para não consumir muito a API

GET DA API:

{
	"total": 1,
	"hasNext": false,
	"items": [
		{
			"TTJson": [
				{
					"num-seq-medicao": 80,
					"cod-estabel": "01",
					"serie-nota": "U",
					"sld-val-medicao": 0.0, <--- SALDO =0.0 QUANDO A NOTA FOI REGISTRADA
					"num-seq-item": 1,
					"numero-ordem": 20650,
					"val-medicao": 17120.0, <--- VALOR DA MEDIÇÃO
					"dat-medicao": "2026-01-08", <-- data que foi medido pelo TI.
					"sld-rec-medicao": 17120.0, <--- QUANDO HOUVER SALDO A NOTA FOI REGISTRADA.
					"nr-contrato": 369, <-- Numero do contrado
					"dat-prev-medicao": "2026-01-08", <-- Data que a nota foi emitida pelo fornecedor
					"numero-nota": "0000054", <-- NUMERO DA NOTA QUANDO FOI REGISTRADA
					"nome-emit": "EMPRESA MINEIRA DE COMPUTADORES LTDA",
					"dat-receb": "2026-01-08",
					"responsavel": "suporteti"
				},
				{
					"num-seq-medicao": 81,
					"cod-estabel": "01",
					"serie-nota": "U",
					"sld-val-medicao": 0.0,
					"num-seq-item": 1,
					"numero-ordem": 20650,
					"val-medicao": 20550.0, <-- 
					"dat-medicao": "2026-01-26",
					"sld-rec-medicao": 20550.0,
					"nr-contrato": 369,
					"dat-prev-medicao": "2026-01-23",
					"numero-nota": "0053818",
					"nome-emit": "EMPRESA MINEIRA DE COMPUTADORES LTDA",
					"dat-receb": "2026-01-26", <-- Data que o setor fiscal registra
					"responsavel": "gfernandes"
				}
			]
		}
	]
}


GET NO BANCO BACKEND

[
	{
		"_id": "697b417018d40917fd98806b",
		"contrato": {
			"_id": "697b3727d5618244ce2cb17e",
			"fornecedor": {
				"_id": "697b27803f67c554e3f5840b",
				"nome": "EMC",
				"id": "697b27803f67c554e3f5840b"
			},
			"nr-contrato": 369,
			"cod-estabel": "01",
			"observacao": "",
			"createdAt": "2026-01-29T10:32:07.293Z",
			"updatedAt": "2026-01-29T10:32:07.293Z",
			"__v": 0,
			"id": "697b3727d5618244ce2cb17e"
		},
		"num-seq-item": 1,
		"diaEmissao": 25,
		"valor": 69485.33,
		"statusMensal": {
			"2026-01": "atrasada"
		},
		"createdAt": "2026-01-29T11:16:00.433Z",
		"updatedAt": "2026-01-29T12:28:58.271Z",
		"__v": 0
	}
]

Mudar status na pagina de relatório.
ATRADASA: Quando passa da data e a medição não foi realizada pelo time TI
OK: Medição feita pelo time TI

Ao cruzar os dados: Deve mostrar se foi RESTRIADA ou NÂO REGISTRADA.

ATUALIZAR CONTRATO: Quando o valor da nota fiscal vem diferente do valor de contratos fixos. Valor da sequencia é fixo no datasul.
(Setor compras atualiza o valor do contrato)

PENDENTE: Quando a medição não é realizada na data de recebimento.

Ainda do frontend: Emissão >> Vai virar Recebimento. Data que a nota chega no email nosso.

Data Emissão: Data de emissão da nota pelo fornecedor: "dat-prev-medicao" na API.

Cruzar valores se batem, caso contrário criar alerta na sequencia.

