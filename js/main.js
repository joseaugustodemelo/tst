var Narnia = {};

(function (cartola) {

	var timesProcessados = 0;
	var processado = false;
	var times = ['epitaciano-the-best-fc', 'invictos-didi-fc', 'valentinno-fc', 'pains-ec', 'boletos-fc'];
	var atletas_pontuados = [];
	var total_pontos = 0.00;
	var classeOrdenacao = '.pontoparcial';
	var mercadoFechado = true;

	function get_clube(clube_id) {
		switch (clube_id) {
			case 262:
				return 'Flamengo';
			case 263:
				return 'Botafogo';
			case 264:
				return 'Corinthians';
			case 266:
				return 'Fluminense';
			case 275:
				return 'Palmeiras';
			case 276:
				return 'Sao Paulo';
			case 277:
				return 'Santos';
			case 282:
				return 'Atletico-MG';
			case 283:
				return 'Cruzeiro';
			case 284:
				return 'Gremio';
			case 285:
				return 'Internacional';
			case 287:
				return 'Vitoria';
			case 292:
				return 'Sport';
			case 293:
				return 'Atletico-PR';
			case 294:
				return 'Coritiba';
			case 303:
				return 'Ponte Preta';
			case 315:
				return 'Chapecoense';
			case 316:
				return 'Figueirense';
			case 327:
				return 'America-MG';
			case 344:
				return 'Santa Cruz';
		}
	}

	function get_pontuacao_rodada(nome_time, handleData) {
		$.ajax({
			type: "GET",
			contentType: "application/json",
			cache: false,
			url: "load-api.php",
			data: {
				api: "busca-time",
				team_slug: nome_time
			},
			success: function (data) {
				handleData(data);
			}
		});
	}

	function get_status_mercado() {
		$.ajax({
			type: "GET",
			contentType: "application/json",
			cache: false,
			url: "load-api.php",
			data: {
				api: "status-mercado"
			},
			success: function (data) {
				if (data.status_mercado == 'undefined' || data.status_mercado != 2) {
					mercadoFechado = false;
				}
			}
		});
	}

	function get_pontuacao_atletas() {
		$.ajax({
			dataType: "json",
			cache: false,
			url: "load-api.php",
			data: {
				api: "parciais-atletas"
			},
			complete: function (data) {
				if (data && data.responseJSON && data.responseJSON.atletas) {
					atletas_pontuados = data.responseJSON.atletas;
				} else {
					$('#info-mercado').html('Tem parcial n&atilde;o tioz&atilde;o!');
					classeOrdenacao = '.ponto';
				}
				for (var i = 0; i < times.length; i++) {
					timesProcessados++;
					get_pontuacao_rodada(times[i], function (obj) {
						montaTime(obj);
					});
				}
			}
		});
	}

	function montaTime(data) {
		var imgEscudo = data.time.url_escudo_png;
		var imgPerfil = data.time.foto_perfil;

		var nome = data.time.nome;
		var nome_cartola = data.time.nome_cartola;
		var pontos = data.pontos.toFixed(2);
		var patrimonio = data.patrimonio;

		var atletas_html = createAtletasTimeHtml(data.atletas, data.posicoes);
		var parcial_rodada = total_pontos.toFixed(2);
		var slug_time = data.time.slug;
		var pontos_ordenacao = (total_pontos == 0.00 && !mercadoFechado) ? pontos : total_pontos;
		var pro = data.time.assinante == true ? '<img src="https://cartolafc.globo.com/dist/0.6.9/img/selo-cartoleiro-pro.svg" class="cartola-pro">' : '';

		$('#narnia-table').append('<tr class="' + slug_time + '" data-row="' + slug_time + '" data-total="' + pontos_ordenacao + '"><td colspan="1"><div class="col-xs-12">' + pro + '<img src="' + imgEscudo + '" style="width: 50px;"><img style="width: 30px;position: absolute;left: 45px;top: 25px;" src="' + imgPerfil + '" class="img-circle"></div></td><td colspan="3"><h3>' + nome + '</h3><p>' + nome_cartola + '</p></td><td colspan="2"><p class="ponto" style="text-align: center">' + pontos + '</p></td><td colspan="2" style="text-align: center"><p class="pontoparcial">' + parcial_rodada + '</p></td><td colspan="2" style="text-align: center;"><p class="patrimonio">' + patrimonio + '</p></td><td colspan="2" style="text-align: center" class="coca"></td></tr>');
		if (atletas_html != '')
			$('#narnia-table').append('<tr class="' + slug_time + '"	>' + atletas_html + '</tr>');

		total_pontos = 0.00;
	}

	function createAtletasTimeHtml(atletas_time, posicoes) {
		var atletas = '';
		for (var i = 0; i < atletas_time.length; i++) {
			atletas += getTemplateAtleta(atletas_time[i], posicoes);
		}
		return atletas;
	}

	function getTemplateAtleta(data, posicoes) {
		var atletaPontuado = atletas_pontuados[data.atleta_id];
		var pontuacao = 0.00;

		if (typeof atletaPontuado !== 'undefined') {
			pontuacao = atletaPontuado.pontuacao;
			total_pontos += pontuacao;
		}

		var foto = data.foto;
		if (foto === null)
			foto = '';
		var posicao = posicoes[data.posicao_id].abreviacao;
		var clube_id = data.clube_id;

		return '<td><div class="col-xs-12">' +
				'<p style="font-size: small">' + data.apelido + ' (' + posicao + ')' + '</p>' +
				'<p style="font-size: small">' + get_clube(clube_id) + '</p>' +
				'<img style="width: 40px;" src="' + foto.replace("FORMATO", "140x140") + '">' +
				'<p>' + pontuacao + '<p>' +
				'</div></td>';
	}

	function quem_paga() {
		var menorObj = $(classeOrdenacao).first();
		var menorValor = parseFloat($(classeOrdenacao).first().text());
		$(classeOrdenacao).each(function (i, obj) {
			if (parseFloat($(obj).text()) < menorValor) {
				menorObj = obj;
				menorValor = parseFloat($(obj).text());
			}
		});

		var parent = $(menorObj).parent().parent();
		parent.addClass('paga-coca');
	}

	function mito() {
		var theLegend = $('#narnia-table > tbody > tr')[0];
		$(theLegend).addClass('mito');
	}

	function ordena() {
		var rows = $('#narnia-table > tbody > tr');
		var data_row = [], data_total = [], data_row_attr = '', data_total_attr = '';
		for (var i = 0; i < rows.length; i++) {
			data_row_attr = $(rows[i]).data('row');
			data_total_attr = $(rows[i]).data('total');

			if (typeof data_row_attr !== 'undefined')
				data_row.push(data_row_attr);
			if (typeof data_total_attr !== 'undefined')
				data_total.push(data_total_attr);
		}
		var arrr = [];
		for (var h = 0; h < data_row.length; h++) {
			arrr[h + '-' + data_total[h]] = data_row[h];
		}

		var ordenado = [];
		data_total = data_total.sort(function (a, b) {
			return b - a;
		});
		for (var t = 0; t < data_total.length; t++) {
			for (var x = 0; x < data_total.length; x++) {
				var arrr2 = arrr[x + '-' + data_total[t]];
				if ((typeof arrr2 !== 'undefined') && (ordenado.indexOf(arrr2) == -1))
					ordenado.push(arrr2);
			}
		}

		var row_o = '';
		$(ordenado).each(function (i, obj) {
			row_o = $("#narnia-table > tbody > ." + obj);
			$('#narnia-table > tbody').append(row_o);
		});
	}

	cartola.initialize = function () {
		$(document).ready(function () {
			get_status_mercado();
			get_pontuacao_atletas();
		}).ajaxStop(function () {
			if (!processado && times.length == timesProcessados) {
				processado = true;
				ordena();
				quem_paga();
				mito();
				$('#narnia-table').show();
				$('#spinner').hide();
			}
		});
	}
}(Narnia));

Narnia.initialize();
