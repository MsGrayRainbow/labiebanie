var super_shift = function(array, times) {
  var result = [];
  for(var i = 0; i < times; ++i) {
    result.push( array.shift() );
  }
  return result;
}

var split_shift = function(array, split_length) {
  var result = [];


  var temp_shifted_array = [];
  for(var i = 0, l = array.length, sl = 0; i < l; ++sl, ++i) {
    console.log('i = ' + i + ' ::: sl = ' + sl + ' ::: l = ' + l + ' ::: array[i] = ' + array[0]);
    if(sl < split_length) {
      temp_shifted_array.push( array.shift() )

      if( (i + 1) == l ) {
        result.push( temp_shifted_array.join('') );
      }
    }
    else {
      result.push( temp_shifted_array.join('') );
      temp_shifted_array = [];
      sl = -1; --i;
    }
  }


  return result;
}

var EncryptionMatrix = function( input_original_text, input_encrypted_text, input_encryption_key, callback ) {
  this.original_text        = input_original_text;
  this.encrypted_text       = input_encrypted_text;
  this.decrypted_text       = '';
  this.encryption_key       = input_encryption_key;
  this.encryption_sequence  = this.encryption_key;

  this.matrix           = [];
  this.encrypted_matrix = [];

  this.rows_count = 0;
  this.cols_count = 0;

  var rows_count_holder = (this.original_text.length > 0 ) 
    ? this.original_text.length 
    : this.encrypted_text.length;

  if(this.encryption_sequence         != undefined && 
     this.encryption_sequence.length  != 0 &&
     this.encryption_sequence.length  > 1 &&
     this.encryption_sequence         != null) {

    this.rows_count = Math.ceil ( rows_count_holder / this.encryption_key.length );
    this.cols_count = this.encryption_key.length;

    this.encryption_sequence = this.encryption_sequence.split('').map(Number);
  } else {

    this.rows_count = Math.ceil ( rows_count_holder / this.encryption_key );
    this.cols_count = this.encryption_key;

    this.encryption_sequence = [];
    var encryption_generator = this.encryption_key;
    while( encryption_generator > 0 )
      this.encryption_sequence.push( encryption_generator-- );
    this.encryption_sequence.shuffle();
  }


  for(var i = 0; i < this.rows_count; ++i) {
    this.matrix.push([]);
    this.encrypted_matrix.push([]);
    for(var j = 0; j < this.cols_count; ++j) {
      this.matrix[i].push('*');
      this.encrypted_matrix[i].push('*');
    }
  }

  if(typeof callback == 'function') callback(this);
}

EncryptionMatrix.prototype.encrypt = function(callback) {

  var shifted_text = this.original_text.split('');
  for(var i = 0; i < this.rows_count; ++i) {
    for(var j = 0; j < this.cols_count; ++j) {
      if(shifted_text.length != 0)
        this.matrix[i][j] = shifted_text.shift();
      else
        break;
    }
  }

  this.encrypted_text = new Array(this.encryption_sequence.length);
  for(var i = 0, l = this.encrypted_text.length; i < l; ++i) {
    this.encrypted_text[i] = '';
  }

  for(var j = 0; j < this.cols_count; ++j) {
    for(var i = 0; i < this.rows_count; ++i) {

      this.encrypted_text[ this.encryption_sequence[j] - 1 ] += this.matrix[i][j];
    }
  }

  this.encrypted_text = this.encrypted_text.join('');

  if(typeof callback == 'function') callback(this);
};


EncryptionMatrix.prototype.decrypt = function(callback) {

  var shifted_encrypted_text = this.encrypted_text.split('');
  shifted_encrypted_text = split_shift(shifted_encrypted_text, this.rows_count);
  
  for(var n = 0, enc_seq_length = this.encryption_sequence.length; n < enc_seq_length; ++n) {
    var encrypted_substring = shifted_encrypted_text[ this.encryption_sequence[n] - 1 ].split('');
    for(var i = 0; i < this.rows_count; ++i) {
      this.encrypted_matrix[i][n] = encrypted_substring[i];
    }
  }

  this.decrypted_text = '';
  for(var i = 0; i < this.rows_count; ++i)
    this.decrypted_text += this.encrypted_matrix[i].filter(function(value) { return value != '*'}).join('');

  if(typeof callback == 'function') callback(this);
};

// Example
// encryption_matrix = new EncryptionMatrix( 'лакрица', 'р*ацкали', '4231' );
// encryption_matrix.encrypt(function(enc_obj) { console.log(enc_obj.encrypted_text); });
// encryption_matrix.decrypt(function(enc_obj) { console.log(enc_obj.decrypted_text); });

/* Web-interface event bindings */
jQuery(document).ready(function() {

  // Encryption web-interface bindings
  jQuery('#l1_enc_encrypt_btn').click(function() {
    var original_text  = jQuery('#l1_enc_original_text').val();
    var encryption_key = jQuery('#l1_enc_encryption_key').val();
    var encrypted_text = jQuery('#l1_enc_encrypted_text').val();

    var encryption_matrix = new EncryptionMatrix( original_text, encrypted_text, encryption_key );

    encryption_matrix.encrypt(function(enc_obj) {
      jQuery('#l1_enc_encrypted_text').text(enc_obj.encrypted_text);

      jQuery('#l1_enc_result_table').html('<thead><tr></tr></thead><tbody></tbody>');

      for(var n = 0; n < enc_obj.encryption_sequence.length; ++n) {
        jQuery('#l1_enc_result_table thead tr').append(
          '<th>' + enc_obj.encryption_sequence[n] +'</th>'
        );
      }

      for(var i = 0; i < enc_obj.rows_count; ++i) {
        var tr = '<tr>';
        for(var j = 0; j < enc_obj.cols_count; ++j)
          tr += '<td>' + enc_obj.matrix[i][j] + '</td>';
        tr += '</tr>';
        jQuery('#l1_enc_result_table').append(tr);
      }

    });


  });

  // Decryption web-interface bindings
  jQuery('#l1_dec_decrypt_btn').click(function() {
    var encrypted_text = jQuery('#l1_dec_encrypted_text').val();
    var encryption_key = jQuery('#l1_dec_encryption_key').val();
    var decrypted_text = jQuery('#l1_dec_decrypted_text').val();

    var encryption_matrix = new EncryptionMatrix( decrypted_text, encrypted_text, encryption_key );
    
    encryption_matrix.decrypt(function(enc_obj) {
      jQuery('#l1_dec_decrypted_text').text(enc_obj.decrypted_text);

      jQuery('#l1_dec_result_table').html('<thead><tr></tr></thead><tbody></tbody>');

      for(var n = 0; n < enc_obj.encryption_sequence.length; ++n) {
        jQuery('#l1_dec_result_table thead tr').append(
          '<th>' + enc_obj.encryption_sequence[n] +'</th>'
        );
      }

      for(var i = 0; i < enc_obj.rows_count; ++i) {
        var tr = '<tr>';
        for(var j = 0; j < enc_obj.cols_count; ++j)
          tr += '<td>' + enc_obj.encrypted_matrix[i][j] + '</td>';
        tr += '</tr>';
        jQuery('#l1_dec_result_table').append(tr);
      }

    });

  });

});
