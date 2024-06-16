<script lang="ts">
  let ytUrl = '';
  let downloadLink = '';

  let error_occurred = false;

  async function downloadVideo() {
    error_occurred = false;
    try {
      const response = await fetch('/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: ytUrl })
      });
      if (!response.ok) {
        error_occurred = true;
      }
      else {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'video.mp4'); // specify the filename
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      error_occurred = true;
    }
  }
</script>

<main>
  <h1 class="h1">
    <span class="bg-gradient-to-br from-pink-500 to-violet-500 bg-clip-text text-transparent box-decoration-clone">Adam's YT Downloader</span>
  </h1>
  <input class = "input" type="text" bind:value={ytUrl} placeholder="Enter YouTube URL" />
  <button class="btn variant-filled" on:click={downloadVideo}>Download</button>
  {#if error_occurred}
    <p class = "text-error-500" >An error occurred, check the video URL and try again. Otherwise, contact Adam.</p>
  {/if}
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    gap: 1em;
  }

  input {
    width: 300px;
    padding: 10px;
    margin-bottom: 10px;
  }

  button {
    padding: 10px 20px;
  }
</style>
